export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // remove the data url prefix (e.g., "data:audio/webm;base64,")
      const base64String = base64data.split(',')[1];
      if (!base64String) {
        reject(new Error("Failed to convert blob to base64: result is empty."));
        return;
      }
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}
