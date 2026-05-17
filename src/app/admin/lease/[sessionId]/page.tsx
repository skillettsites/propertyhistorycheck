import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import LeaseUploadForm from "./LeaseUploadForm";

export const dynamic = "force-dynamic";

interface LeaseOrderRow {
  id: number;
  report_id: string | null;
  stripe_session_id: string;
  status: "pending" | "ready" | "failed";
  customer_email: string;
  full_address: string | null;
  postcode: string;
  title_number: string | null;
  document_url: string | null;
  ordered_at: string;
  fulfilled_at: string | null;
  note: string | null;
}

export default async function LeaseAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { sessionId } = await params;
  const { k } = await searchParams;

  // Simple shared-secret gate — set ADMIN_KEY in Vercel env, append ?k=<key> to URL.
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || k !== adminKey) {
    notFound();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lease_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) notFound();
  const row = data as LeaseOrderRow;

  const hmlrUrl = row.title_number
    ? `https://eservices.landregistry.gov.uk/wps/portal/Property_Search?titleNumber=${encodeURIComponent(row.title_number)}`
    : "https://eservices.landregistry.gov.uk/wps/portal/Property_Search";

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-xs uppercase tracking-wider font-bold text-blue-700">Operator: lease fulfilment</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{row.full_address ?? row.postcode}</h1>
        <p className="text-sm text-slate-500">
          Status: <span className={`font-semibold ${row.status === "ready" ? "text-emerald-700" : row.status === "failed" ? "text-red-700" : "text-amber-700"}`}>{row.status}</span>
          {" · "}Buyer: {row.customer_email}
          {" · "}Ordered {new Date(row.ordered_at).toLocaleString("en-GB")}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">Step 1 — order from HM Land Registry</p>
          <p className="mt-1 text-sm text-slate-700">Title number: <code className="font-mono">{row.title_number ?? "(search by address)"}</code></p>
          <a
            href={hmlrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold"
          >
            Open HMLR portal &rarr;
          </a>
          <p className="mt-2 text-xs text-slate-500">Use OC2 (registered lease document). Fee £7. Doc arrives by email within minutes-hours.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">Step 2 — upload the PDF</p>
          <LeaseUploadForm
            sessionId={row.stripe_session_id}
            adminKey={adminKey}
            currentDocumentUrl={row.document_url}
            currentStatus={row.status}
          />
        </div>

        {row.note ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-900">Operator note</p>
            <p className="mt-1 text-xs text-amber-800">{row.note}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
