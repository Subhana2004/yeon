import { exampleDoor } from "./catalog.js";

// A public record enters the verified collection only with a source and a check date.
// Verification describes the source check. Availability also depends on its closing date.
export const opportunities = [exampleDoor];
export function availableStatus(
  record,
  today = new Date().toISOString().slice(0, 10),
) {
  if (
    record.status === "Expired" ||
    (record.deadline && record.deadline < today)
  )
    return "Expired";
  return record.status === "Open" && record.url && record.verified
    ? "Open"
    : "Unknown";
}
export const sourceUrl = (record) => {
  try {
    const u = new URL(record.url);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
};
export const verifiedRecord = (record) =>
  record.kind === "public" && Boolean(sourceUrl(record) && record.verified);
export const listFor = (mode) =>
  opportunities.filter((record) =>
    mode === "sample" ? record.kind === "fictional" : verifiedRecord(record),
  );
