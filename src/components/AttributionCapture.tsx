"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

/**
 * Captures first-touch attribution (landing page, referrer, UTMs) on the first
 * page of the session, whatever that page is. Previously capture only ran on
 * /check, so every sale recorded landing_page="/check" and the true entry page
 * (usually a blog post) was lost. captureAttribution() is a no-op after the
 * first call in a session, so mounting this globally cannot overwrite anything.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
