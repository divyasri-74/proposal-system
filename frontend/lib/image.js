const MAX_SVG_BYTES = 300 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read the image"));
    r.readAsDataURL(file);
  });

/** Turns an uploaded logo into a small data URL. Raster images are downscaled to 480px wide. */
export async function fileToLogoDataUrl(file) {
  if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) throw new Error("Use a PNG, JPG, WEBP or SVG image");
  if (file.size > MAX_FILE_BYTES) throw new Error("Logo is too large (max 5MB)");

  const dataUrl = await readAsDataUrl(file);
  if (file.type === "image/svg+xml") {
    if (file.size > MAX_SVG_BYTES) throw new Error("SVG logo is too large (max 300KB)");
    return dataUrl;
  }

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Invalid image file"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, 480 / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
