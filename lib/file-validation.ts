const MAX_FILE_SIZE = 25 * 1024 * 1024;

const FILE_TYPES = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
} as const;

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function includesAscii(bytes: Uint8Array, value: string) {
  const needle = new TextEncoder().encode(value);
  outer: for (let index = 0; index <= bytes.length - needle.length; index += 1) {
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (bytes[index + offset] !== needle[offset]) continue outer;
    }
    return true;
  }
  return false;
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export type ValidatedClinicalFile = {
  bytes: ArrayBuffer;
  checksum: string;
  mimeType: string;
  safeName: string;
};

export async function validateClinicalFile(file: File): Promise<ValidatedClinicalFile> {
  if (!file.name || file.size < 4 || file.size > MAX_FILE_SIZE) throw new Error("El archivo debe pesar entre 4 bytes y 25 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() as keyof typeof FILE_TYPES | undefined;
  if (!extension || !FILE_TYPES[extension]) throw new Error("Usa únicamente PDF, PNG, JPG, WEBP o PPTX.");
  const bytes = await file.arrayBuffer();
  const view = new Uint8Array(bytes);
  let valid = false;
  if (extension === "pdf") {
    valid = startsWith(view, [0x25, 0x50, 0x44, 0x46, 0x2d]) && includesAscii(view.subarray(Math.max(0, view.length - 2048)), "%%EOF");
    const blockedPdfFeatures = ["/JavaScript", "/JS", "/Launch", "/EmbeddedFile"];
    if (blockedPdfFeatures.some((feature) => includesAscii(view, feature))) throw new Error("El PDF contiene funciones activas o archivos incrustados no permitidos.");
  } else if (extension === "png") {
    valid = startsWith(view, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) && includesAscii(view.subarray(Math.max(0, view.length - 32)), "IEND");
  } else if (extension === "jpg" || extension === "jpeg") {
    valid = startsWith(view, [0xff, 0xd8, 0xff]) && view.at(-2) === 0xff && view.at(-1) === 0xd9;
  } else if (extension === "webp") {
    valid = startsWith(view, [0x52, 0x49, 0x46, 0x46]) && includesAscii(view.subarray(8, 16), "WEBP");
  } else if (extension === "pptx") {
    valid = startsWith(view, [0x50, 0x4b, 0x03, 0x04]) && includesAscii(view, "[Content_Types].xml") && includesAscii(view, "ppt/");
  }
  if (!valid) throw new Error("El contenido del archivo no coincide con su extensión o está incompleto.");
  const checksum = hex(await crypto.subtle.digest("SHA-256", bytes));
  const baseName = file.name.slice(0, -(extension.length + 1)).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "archivo";
  return { bytes, checksum, mimeType: FILE_TYPES[extension], safeName: `${baseName}.${extension}` };
}
