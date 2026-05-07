import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tier = body.tier as string;
    const product = getProduct(tier);
    if (!product) {
      return NextResponse.json({ error: "invalid_product" }, { status: 400 });
    }

    const postcode = (body.postcode as string | undefined)?.toUpperCase();
    const uprn = body.uprn as string | undefined;
    const fullAddress = body.fullAddress as string | undefined;
    const attribution = (body.attribution ?? {}) as Record<string, string>;

    if (!postcode) {
      return NextResponse.json({ error: "postcode_required" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.propertyhistorycheck.co.uk";
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}&postcode=${encodeURIComponent(postcode)}`;
    const cancelUrl = `${origin}/check?postcode=${encodeURIComponent(postcode)}&checkout=cancelled`;

    const priceId =
      tier === "premium"
        ? process.env.STRIPE_PRICE_ID_PREMIUM
        : process.env.STRIPE_PRICE_ID_STANDARD;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "gbp",
                unit_amount: product.priceInPence,
                product_data: { name: product.name, description: product.description },
              },
              quantity: 1,
            },
          ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        postcode,
        uprn: uprn ?? "",
        full_address: fullAddress ?? "",
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

