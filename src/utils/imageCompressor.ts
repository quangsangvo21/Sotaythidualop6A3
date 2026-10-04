/**
 * Utilities for client-side image compression and Base64 conversion
 */

export function validateImageSize(file: File, maxBytes: number = 2 * 1024 * 1024): boolean {
  return file.size <= maxBytes;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Resizes and compresses an image file to Base64 (JPEG)
 * Keeps aspect ratio, max width/height = 320px, quality = 0.85
 */
export async function compressImageToBase64(
  file: File,
  maxWidth: number = 320,
  maxHeight: number = 320,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File ảnh không hợp lệ'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không thể khởi tạo Canvas 2D'));
          return;
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 JPEG data URL
        const base64Data = canvas.toDataURL('image/jpeg', quality);
        resolve(base64Data);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
