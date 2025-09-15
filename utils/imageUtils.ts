
export const resizeImage = (base64Str: string, maxWidth: number = 1024): Promise<string> => {
    // Bypassing resizing to allow for full-resolution images.
    // The original logic would scale down images wider than maxWidth.
    return Promise.resolve(base64Str);
};
  
  export const createThumbnail = (base64Str: string, width: number = 160, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = width / img.width;
            canvas.width = width;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64Str); // fallback
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => {
            resolve(base64Str); // fallback
        };
    });
  };

  export const base64ToFile = (dataUrl: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const arr = dataUrl.split(',');
      if (arr.length < 2) {
        return reject(new Error('Invalid data URL'));
      }
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch || mimeMatch.length < 2) {
        return reject(new Error('Could not determine MIME type from data URL'));
      }
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new File([u8arr], filename, { type: mime }));
    });
  };

  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };