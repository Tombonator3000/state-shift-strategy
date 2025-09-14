import type { Card, ExportRow } from "./types";
import { getAllCards } from "./getCards";

function toExportRow(card: Card): ExportRow {
  return {
    id: card.id,
    name: card.name,
    faction: card.faction ?? "",
    type: card.type,
    rarity: card.rarity ?? "",
    cost: card.cost,
    effects: JSON.stringify(card.effects ?? {}),
  };
}

function toCSV(rows: ExportRow[]): string {
  const header = ["id","name","faction","type","rarity","cost","effects"].join(",");
  const body = rows
    .map(r => [
      r.id,
      (r.name ?? "").replaceAll('"','""'),
      r.faction ?? "",
      r.type ?? "",
      r.rarity ?? "",
      String(r.cost ?? ""),
      (r.effects ?? "").replaceAll('"','""'),
    ].map(v => `"${v}"`).join(","))
    .join("\n");
  return header + "\n" + body;
}

function download(filename: string, content: string, mime = "application/octet-stream") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportEffectsFiles(includeExtensions: boolean) {
  const cards = getAllCards(includeExtensions);
  const rows = cards.map(toExportRow);

  const anomalies = rows.filter(r => !r.id || !r.name || !r.effects);
  if (anomalies.length) {
    // eslint-disable-next-line no-console
    console.warn("[Export Data] Noen rader har mangler:", anomalies.slice(0, 5));
  }

  download("card-effects-v21E.json", JSON.stringify(rows, null, 2), "application/json");
  download("card-effects-v21E.csv", toCSV(rows), "text/csv");
}
