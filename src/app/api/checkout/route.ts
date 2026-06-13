import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";
import { fullReportSupported } from "@/lib/jurisdiction";

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
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
