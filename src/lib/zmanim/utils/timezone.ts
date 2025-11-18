export function getIsraelOffsetHours(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:     "Asia/Jerusalem",
    timeZoneName: "short"
  }).formatToParts(date);
  const tz = parts.find(p => p.type === "timeZoneName")?.value || "GMT+2";
  return Number(tz.replace("GMT", "")); 
}

