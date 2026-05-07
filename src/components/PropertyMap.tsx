"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

// Default Leaflet markers don't load in webpack/turbopack — point them at the CDN.
const ICON = L.divIcon({
  className: "phc-property-icon",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#1d4ed8;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const SCHOOL_ICON = (rating?: string) => {
  const colour =
    rating === "Outstanding" ? "#059669"
    : rating === "Good" ? "#2563eb"
    : rating === "Requires Improvement" ? "#d97706"
    : rating === "Inadequate" ? "#dc2626"
    : "#64748b";
  return L.divIcon({
    className: "phc-school-icon",
    html: `<div style="width:18px;height:18px;border-radius:4px;background:${colour};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700">S</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

interface SchoolPin {
  name: string;
  lat: number;
  lng: number;
  rating?: string;
  phase?: string;
  distance?: number;
}

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  schools?: SchoolPin[];
  /** Polygons to overlay (GeoJSON FeatureCollection or array) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson?: any;
  /** Fill colour for geojson layer */
  geojsonStyle?: { color: string; fillColor: string; fillOpacity: number };
  /** Optional radius circle (metres) to indicate "search area" */
  radius?: number;
}

export default function PropertyMap({
  lat, lng, zoom = 15, height = 280,
  schools, geojson, geojsonStyle, radius,
}: Props) {
  const center: [number, number] = useMemo(() => [lat, lng], [lat, lng]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {geojson && (
          <GeoJSON
            data={geojson}
            style={() => ({
              color: geojsonStyle?.color ?? "#1d4ed8",
              weight: 2,
              fillColor: geojsonStyle?.fillColor ?? "#3b82f6",
              fillOpacity: geojsonStyle?.fillOpacity ?? 0.25,
            })}
          />
        )}
        {radius && (
          <Circle
            center={center}
            radius={radius}
            pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.05, weight: 1, dashArray: "4 4" }}
          />
        )}
        <Marker position={center} icon={ICON}>
          <Popup>This property</Popup>
        </Marker>
        {schools?.map((s) => (
          <Marker key={`${s.name}-${s.lat}`} position={[s.lat, s.lng]} icon={SCHOOL_ICON(s.rating)}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.phase ? `${s.phase} · ` : ""}
              {s.rating ?? "Not inspected"}
              {s.distance ? ` · ${s.distance.toFixed(1)} km` : ""}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
