/* =========================================================
   ToolZen Hub
   Small previews of chosen photos

   Used by the Image Compressor & Resizer (a batch list) and by Photos
   to PDF (its list). The browser decodes the file, applies the EXIF
   turn and draws it into the given canvas, `side` pixels on its longer
   side. No object URL is made and the decoded picture is closed at once.
========================================================= */

/*
 * Resolves to true when drawn, false when the browser could not decode the file.
 */
export async function makeThumbnail(file, canvas, side = 160) {

    let bitmap;

    try {

        try {
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image", resizeWidth: side, resizeQuality: "low" });
        } catch {
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        }

        const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

        return true;

    } catch {

        return false;

    } finally {

        if (bitmap) bitmap.close();

    }

}
