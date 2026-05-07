"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON, ScaleControl, CircleMarker, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

const PROPERTY_ICON = L.divIcon({
  className: "phc-property-icon",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px"><div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(29,78,216,0.18);animation:phcPulse 2s ease-in-out infinite"></div><div style="position:relative;width:22px;height:22px;border-radius:50%;background:#1d4ed8;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:900">★</div></div><style>@keyframes phcPulse{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.5);opacity:0.3}}</style>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
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
    html: `<div style="width:20px;height:20px;border-radius:4px;background:${colour};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700">S</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const STATUS_COLOURS: Record<string, string> = {
  Permitted: "#059669",
  Pending: "#d97706",
  Rejected: "#dc2626",
  Withdrawn: "#64748b",
  Unknown: "#64748b",
};

const APP_ICON = (status: string) => {
  const c = STATUS_COLOURS[status] ?? "#1d4ed8";
  return L.divIcon({
    className: "phc-app-icon",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${c};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const CRIME_COLOURS: Record<string, string> = {
  "violent-crime": "#dc2626",
  "anti-social-behaviour": "#f97316",
  "burglary": "#7c3aed",
  "robbery": "#dc2626",
  "vehicle-crime": "#0891b2",
  "criminal-damage-arson": "#d97706",
  "shoplifting": "#0284c7",
  "theft-from-the-person": "#be185d",
  "other-theft": "#0284c7",
  "drugs": "#16a34a",
  "public-order": "#ea580c",
  "possession-of-weapons": "#dc2626",
  "bicycle-theft": "#0891b2",
  "other-crime": "#64748b",
};

interface SchoolPin { name: string; lat: number; lng: number; rating?: string; phase?: string; distance?: number; }
interface AppPin { name: string; lat: number; lng: number; status: string; description?: string; }
interface CrimePin { lat: number; lng: number; categorySlug: string; category: string; street?: string; }

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  schools?: SchoolPin[];
  appPins?: AppPin[];
  crimePins?: CrimePin[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson?: any;
  geojsonStyle?: { color: string; fillColor: string; fillOpacity: number };
  /** Style flood-zone polygons by zone (2 amber, 3 red) */
  floodZoneStyle?: boolean;
  radius?: number;
  /** Auto-zoom to fit GeoJSON bounds */
  fitBounds?: boolean;
  /** Bottom-right legend items */
  legend?: Array<{ colour: string; label: string }>;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useMemo(() => {
    if (bounds) {
      try { map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 }); } catch {/* noop */}
    }
  }, [bounds, map]);
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geojsonBounds(geojson: any): LatLngBoundsExpression | null {
  if (!geojson?.features?.length) return null;
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (coords: any) => {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords;
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      coords.forEach((c: any) => visit(c));
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geojson.features.forEach((f: any) => f.geometry && visit(f.geometry.coordinates));
  if (!Number.isFinite(minLat)) return null;
  return [[minLat, minLng], [maxLat, maxLng]];
}

export default function PropertyMap({
  lat, lng, zoom = 15, height = 320,
  schools, appPins, crimePins, geojson, geojsonStyle, floodZoneStyle, radius, fitBounds, legend,
}: Props) {
  const center: [number, number] = useMemo(() => [lat, lng], [lat, lng]);
  const bounds = useMemo(() => (fitBounds && geojson ? geojsonBounds(geojson) : null), [fitBounds, geojson]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 relative" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {geojson?.features?.length && (
          <GeoJSON
            data={geojson}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={(feature: any) => {
              if (floodZoneStyle) {
                const zone = feature?.properties?.zone ?? 2;
                if (zone === 3) return { color: "#dc2626", weight: 2, fillColor: "#dc2626", fillOpacity: 0.4 };
                return { color: "#d97706", weight: 2, fillColor: "#f59e0b", fillOpacity: 0.35 };
              }
              return {
                color: geojsonStyle?.color ?? "#1d4ed8",
                weight: 2,
                fillColor: geojsonStyle?.fillColor ?? "#3b82f6",
                fillOpacity: geojsonStyle?.fillOpacity ?? 0.3,
              };
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onEachFeature={(feature: any, layer: any) => {
              const zone = feature?.properties?.zone;
              if (zone) layer.bindPopup(`<strong>Flood Zone ${zone}</strong><br/>${feature.properties.riskType ?? ""}`);
            }}
          />
        )}
        {radius && (
          <Circle
            center={center}
            radius={radius}
            pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.04, weight: 1.5, dashArray: "5 5" }}
          />
        )}
        {crimePins?.map((c, i) => (
          <CircleMarker
            key={`c-${i}`}
            center={[c.lat, c.lng]}
            radius={4.5}
            pathOptions={{
              color: CRIME_COLOURS[c.categorySlug] ?? "#64748b",
              fillColor: CRIME_COLOURS[c.categorySlug] ?? "#64748b",
              fillOpacity: 0.55,
              weight: 1,
            }}
          >
            <Popup><strong>{c.category}</strong>{c.street ? <><br/>{c.street}</> : null}</Popup>
          </CircleMarker>
        ))}
        {schools?.map((s) => (
          <Marker key={`s-${s.name}-${s.lat}`} position={[s.lat, s.lng]} icon={SCHOOL_ICON(s.rating)}>
            <Popup>
              <strong>{s.name}</strong><br />
              {s.phase ? `${s.phase} · ` : ""}{s.rating ?? "Not inspected"}
              {s.distance ? ` · ${s.distance.toFixed(1)} km` : ""}
            </Popup>
          </Marker>
        ))}
        {appPins?.map((p, i) => (
          <Marker key={`a-${i}`} position={[p.lat, p.lng]} icon={APP_ICON(p.status)}>
            <Popup>
              <strong>{p.status}</strong><br />
              {p.name}{p.description ? <><br/><span style={{ fontSize: 11 }}>{p.description.slice(0, 120)}</span></> : null}
            </Popup>
          </Marker>
        ))}
        <Marker position={center} icon={PROPERTY_ICON} zIndexOffset={1000}>
          <Popup>This property</Popup>
        </Marker>
        <ScaleControl position="bottomleft" imperial={false} />
        {bounds && <FitBounds bounds={bounds} />}
      </MapContainer>
      {legend && legend.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow px-3 py-2 text-[10px] z-[400] max-w-[200px]">
          <p className="font-bold text-gray-700 mb-1 uppercase tracking-wider text-[9px]">Legend</p>
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 mb-0.5 last:mb-0">
              <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: l.colour }} />
              <span className="text-gray-700">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
