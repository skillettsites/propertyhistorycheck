import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Ews1UpdateForm from "./Ews1UpdateForm";

export const dynamic = "force-dynamic";

interface Ews1OrderRow {
  id: number;
  report_id: string | null;
  stripe_session_id: string;
  status: "pending" | "ready" | "failed";
  customer_email: string;
  full_address: string | null;
  postcode: string;
  building_name: string | null;
  hrb_registered: boolean | null;
  rating: string | null;
  assessed_on: string | null;
  assessor: string | null;
  document_url: string | null;
  notes: string | null;
  ordered_at: string;
  fulfilled_at: string | null;
}

export default async function Ews1AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { sessionId } = await params;
  const { k } = await searchParams;

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || k !== adminKey) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ews1_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) notFound();
  const row = data as Ews1OrderRow;

  const postcodeEnc = encodeURIComponent(row.postcode);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-xs uppercase tracking-wider font-bold text-blue-700">Operator: EWS1 cladding check</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{row.full_address ?? row.postcode}</h1>
        <p className="text-sm text-slate-500">
          Status: <span className={`font-semibold ${row.status === "ready" ? "text-emerald-700" : row.status === "failed" ? "text-red-700" : "text-amber-700"}`}>{row.status}</span>
          {" · "}Buyer: {row.customer_email}
          {" · "}Ordered {new Date(row.ordered_at).toLocaleString("en-GB")}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">Step 1 — check the 3 portals</p>
          <p className="mt-1 text-xs text-slate-500">Postcode: <code className="font-mono">{row.postcode}</code>{row.building_name ? <> · Building: <code className="font-mono">{row.building_name}</code></> : null}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`https://www.register-high-rise-building.service.gov.uk/public-register/search?postcode=${postcodeEnc}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">
                BSR HRB Register &rarr;
              </a>
              <span className="text-slate-500 ml-2">— mandatory register for buildings ≥18m / ≥7 storeys</span>
            </li>
            <li>
              <a href="https://www.fia.uk.com/ews1.html" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">
                FIA EWS1 Portal &rarr;
              </a>
              <span className="text-slate-500 ml-2">— voluntary uploads; bank-sponsored. PDF download.</span>
            </li>
            <li>
              <a href="https://buildingsafetyportal.co.uk/search_forms" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">
                Building Safety Portal &rarr;
              </a>
              <span className="text-slate-500 ml-2">— EWS1 form verification + search.</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">Step 2 — post findings</p>
          <Ews1UpdateForm
            sessionId={row.stripe_session_id}
            adminKey={adminKey}
            current={{
              hrbRegistered: row.hrb_registered,
              rating: row.rating,
              assessedOn: row.assessed_on,
              assessor: row.assessor,
              documentUrl: row.document_url,
              notes: row.notes,
              status: row.status,
            }}
          />
        </div>
      </div>
    </main>
  );
}
