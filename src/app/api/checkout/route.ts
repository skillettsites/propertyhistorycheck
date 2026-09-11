import { NextRequest, NextResponse, after } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";
import { fullReportSupported } from "@/lib/jurisdiction";
import { classifyTrafficSource, isTrafficSource } from "@/lib/attribution";
import { deviceFromUserAgent, logCheckoutStart } from "@/lib/search-tracking";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tier = body.tier as string;
    const product = getProduct(tier);
    if (!product) {
      return NextResponse.json({ error: "invalid_product" }, { status: 400 });
    }

    const isUpgrade = tier === "standard_plus_upgrade";
    const existingToken = isUpgrade ? (body.existing_token as string | undefined) : undefined;

    if (isUpgrade && !existingToken) {
      return NextResponse.json({ error: "existing_token_required_for_upgrade" }, { status: 400 });
    }

    const postcode = (body.postcode as string | undefined)?.toUpperCase();
    const uprn = body.uprn as string | undefined;
    const fullAddress = body.fullAddress as string | undefined;
    const attribution = (body.attribution ?? {}) as Record<string, string>;
    // Channel: trust the browser's classification when it is a known value,
    // otherwise classify server-side from the same inputs (older sessions
    // captured before traffic_source existed, or a tampered body).
    const trafficSource = isTrafficSource(attribution.traffic_source)
      ? attribution.traffic_source
      : classifyTrafficSource({
          referrer: attribution.referrer,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
        });
    const attemptRaw = Number(body.attempt);
    const attempt = Number.isInteger(attemptRaw) && attemptRaw > 0 ? attemptRaw : null;

    // Upgrade reuses the existing report's address (already validated at first
    // purchase), only postcode is required for the redirect URL.
    if (!isUpgrade) {
      if (!postcode) {
        return NextResponse.json({ error: "postcode_required" }, { status: 400 });
      }
      const addr = (fullAddress ?? "").trim();
      const looksLikeJustPostcode = !addr || addr.replace(/\s+/g, "").toUpperCase() === postcode.replace(/\s+/g, "").toUpperCase();
      if (looksLikeJustPostcode) {
        return NextResponse.json({ error: "address_required_for_paid_report" }, { status: 400 });
      }
      // Don't sell a report we can't populate: Scotland / Northern Ireland use
      // separate registers we don't ingest, so the report would be mostly empty.
      if (!fullReportSupported(body.country as string | undefined, postcode)) {
        return NextResponse.json({ error: "england_wales_only" }, { status: 400 });
      }
    }

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";
    const successUrl = isUpgrade
      ? `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}&upgrade_token=${encodeURIComponent(existingToken ?? "")}`
      : `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}&postcode=${encodeURIComponent(postcode ?? "")}`;
    const cancelUrl = isUpgrade
      ? `${origin}/r/${encodeURIComponent(existingToken ?? "")}?upgrade=cancelled`
      : `${origin}/check?postcode=${encodeURIComponent(postcode ?? "")}&checkout=cancelled`;

    const priceId =
      tier === "standard" ? process.env.STRIPE_PRICE_ID_STANDARD
      : tier === "standard_plus" ? process.env.STRIPE_PRICE_ID_STANDARD_PLUS
      : tier === "standard_plus_upgrade" ? process.env.STRIPE_PRICE_ID_STANDARD_PLUS_UPGRADE
      : tier === "bundle" ? process.env.STRIPE_PRICE_ID_BUNDLE
      : undefined;

    const lineItem = priceId
      ? { price: priceId, quantity: 1 as const }
      : {
          price_data: {
            currency: "gbp",
            unit_amount: product.priceInPence,
            product_data: { name: product.name, description: product.description },
          },
          quantity: 1 as const,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Keep the Stripe page as light as possible: no phone, no billing address
      // beyond what the card network needs. Fewer fields, less friction.
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      // Let Stripe email anyone who reaches checkout, enters their address and
      // bails. This is the single biggest lever on the ~89% abandonment we see.
      after_expiration: {
        recovery: { enabled: true, allow_promotion_codes: true },
      },
      metadata: {
        tier,
        postcode: postcode ?? "",
        uprn: uprn ?? "",
        full_address: fullAddress ?? "",
        existing_token: existingToken ?? "",
        utm_source: attribution.utm_source ?? "",
        utm_medium: attribution.utm_medium ?? "",
        utm_campaign: attribution.utm_campaign ?? "",
        utm_content: attribution.utm_content ?? "",
        referrer: attribution.referrer ?? "",
        referrer_source: attribution.referrer_source ?? "",
        landing_page: attribution.landing_page ?? "",
        traffic_source: trafficSource,
      },
      allow_promotion_codes: true,
    });

    // Checkout-start log. Runs after the response is sent so it never delays
    // the redirect to Stripe; after() keeps the function alive on Vercel.
    const userAgent = req.headers.get("user-agent");
    const country = req.headers.get("x-vercel-ip-country");
    after(() =>
      logCheckoutStart({
        session_id: session.id,
        tier,
        postcode: postcode ?? null,
        landing_page: attribution.landing_page || null,
        referrer: attribution.referrer || null,
        referrer_source: attribution.referrer_source || null,
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        traffic_source: trafficSource,
        device: deviceFromUserAgent(userAgent),
        user_agent: userAgent ? userAgent.slice(0, 512) : null,
        country: country || null,
        attempt,
        is_upgrade: isUpgrade,
        amount_pence: session.amount_total ?? product.priceInPence,
      }),
    );

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
