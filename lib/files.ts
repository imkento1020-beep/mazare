export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function readFilesAsDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.map(readFileAsDataUrl));
}
