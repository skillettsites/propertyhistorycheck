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
    const leaseAddon = body.leaseAddon === true && tier === "premium";
    const ews1Addon = body.ews1Addon === true && tier === "premium";
    /** Token of an existing paid report — only set on lease-only follow-on purchases. */
    const parentToken = typeof body.parentToken === "string" ? body.parentToken : undefined;

    if (!postcode) {
      return NextResponse.json({ error: "postcode_required" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}&postcode=${encodeURIComponent(postcode)}`;
    const cancelUrl = `${origin}/check?postcode=${encodeURIComponent(postcode)}&checkout=cancelled`;

    const priceId =
      tier === "premium"
        ? process.env.STRIPE_PRICE_ID_PREMIUM
        : tier === "lease-only"
        ? process.env.STRIPE_PRICE_ID_LEASE_ADDON
        : tier === "ews1-only"
        ? process.env.STRIPE_PRICE_ID_EWS1_ADDON
        : process.env.STRIPE_PRICE_ID_STANDARD;

    const baseLineItem = priceId
      ? { price: priceId, quantity: 1 as const }
      : {
          price_data: {
            currency: "gbp",
            unit_amount: product.priceInPence,
            product_data: { name: product.name, description: product.description },
          },
          quantity: 1 as const,
        };

    type LineItem = {
      price?: string;
      price_data?: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; description?: string };
      };
      quantity: number;
    };
    const lineItems: LineItem[] = [baseLineItem];
    if (leaseAddon) {
      const leasePriceId = process.env.STRIPE_PRICE_ID_LEASE_ADDON;
      lineItems.push(
        leasePriceId
          ? { price: leasePriceId, quantity: 1 }
          : {
              price_data: {
                currency: "gbp",
                unit_amount: 999,
                product_data: {
                  name: "Lease document (OC2) — HM Land Registry",
                  description: "Registered lease pulled from HM Land Registry. Delivered within 48 hours.",
                },
              },
              quantity: 1,
            }
      );
    }
    if (ews1Addon) {
      const ews1PriceId = process.env.STRIPE_PRICE_ID_EWS1_ADDON;
      lineItems.push(
        ews1PriceId
          ? { price: ews1PriceId, quantity: 1 }
          : {
              price_data: {
                currency: "gbp",
                unit_amount: 499,
                product_data: {
                  name: "EWS1 Cladding Check",
                  description: "Manual EWS1 cladding status check. Delivered within 48 hours.",
                },
              },
              quantity: 1,
            }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        postcode,
        uprn: uprn ?? "",
        full_address: fullAddress ?? "",
        lease_addon: leaseAddon ? "1" : "0",
        ews1_addon: ews1Addon ? "1" : "0",
        parent_token: parentToken ?? "",
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

