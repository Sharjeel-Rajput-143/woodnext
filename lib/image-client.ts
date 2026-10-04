/** Shrinks a photo in the browser (max 1600px, JPEG) before upload so it is small and fast to load. */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process the photo.");
    context.fillStyle = "#fff"; // flatten transparent PNGs onto white
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Could not process the photo.");
    return blob;
  } finally {
    bitmap.close(); // free the decoded photo from memory
    canvas.width = canvas.height = 0; // and the canvas buffer
  }
}
