export function readImageFileAsDataUrl(file: File, maxDimension = 1600, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo preparar la imagen"));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
