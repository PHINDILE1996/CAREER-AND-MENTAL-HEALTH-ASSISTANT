
export function fileToBase64(file: File): Promise<{
  base64: string;
  mimeType: string;
  dataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      if (!base64) {
        reject(
          new Error('Failed to convert file to base64: result is empty.')
        );
        return;
      }
      resolve({ base64, mimeType: file.type, dataUrl });
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}
