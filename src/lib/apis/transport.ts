/**
 * Transport connectivity score by LSOA from DfT Connectivity Metric.
 * Ported from PostcodeCheck. Score 0-100, higher = better connected.
 */

import transportRaw from "@/data/transport.json";
import { TransportScore } from "../types";

const data = transportRaw as Record<string, number>;

export function getTransportScore(lsoaCode: string | undefined): TransportScore | undefined {
  if (!lsoaCode) return undefined;
  const score = data[lsoaCode];
  if (score === undefined) return undefined;
  return { connectivityScore: score, lsoa: lsoaCode };
}
