// Image compression utility
export const compressImage = (base64String, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    // If not a base64 image or already small, return as-is
    if (!base64String || !base64String.startsWith('data:image') || base64String.length < 50000) {
      resolve(base64String);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if larger than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      
      // Only use compressed if it's actually smaller
      if (compressed.length < base64String.length) {
        resolve(compressed);
      } else {
        resolve(base64String);
      }
    };

    img.onerror = () => {
      resolve(base64String);
    };

    img.src = base64String;
  });
};

// Compress multiple images in parallel
export const compressImages = async (images, maxWidth = 800, quality = 0.7) => {
  const compressed = {};
  const promises = Object.entries(images).map(async ([id, base64]) => {
    compressed[id] = await compressImage(base64, maxWidth, quality);
  });
  await Promise.all(promises);
  return compressed;
};
