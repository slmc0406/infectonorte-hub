import { extractText, getDocumentProxy, renderPageAsImage } from "unpdf";
import { uploadStoredFile } from "@/lib/supabase";

const MAX_TEXT = 400_000;

export type PdfDerived = { text: string | null; thumbnail: Uint8Array | null };

/** Texto completo y miniatura (JPEG) de la primera página. Mejor esfuerzo: nunca lanza. */
export async function derivePdf(bytes: ArrayBuffer): Promise<PdfDerived> {
  const result: PdfDerived = { text: null, thumbnail: null };
  const work = (async () => {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(bytes.slice(0)));
      try {
        const extracted = await extractText(pdf, { mergePages: true });
        const raw = Array.isArray(extracted.text) ? extracted.text.join("\n") : extracted.text;
        result.text = raw.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TEXT);
      } catch { /* sin texto extraíble */ }
      try {
        const canvasModule = await import("@napi-rs/canvas");
        const png = await renderPageAsImage(pdf, 1, { canvasImport: () => import("@napi-rs/canvas"), width: 600 });
        const image = await canvasModule.loadImage(Buffer.from(png));
        const canvas = canvasModule.createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        result.thumbnail = new Uint8Array(canvas.toBuffer("image/jpeg", 82));
      } catch { /* sin miniatura: la tarjeta usa un ícono */ }
      await (pdf as unknown as { destroy?: () => Promise<void> }).destroy?.().catch(() => undefined);
    } catch { /* PDF ilegible: se sube igual */ }
  })();
  await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 25_000))]);
  return result;
}

/** Guarda la miniatura y devuelve su clave de almacenamiento (o null). */
export async function storeThumbnail(resourceId: string, derived: PdfDerived, version?: number) {
  if (!derived.thumbnail || derived.thumbnail.length < 500) return null;
  const key = version ? `thumbs/${resourceId}-v${version}.jpg` : `thumbs/${resourceId}.jpg`;
  try { await uploadStoredFile(key, derived.thumbnail, "image/jpeg", true); return key; }
  catch { return null; }
}
