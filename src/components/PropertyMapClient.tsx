"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 animate-pulse" style={{ height: 280 }} />
  ),
});

export default PropertyMap;
