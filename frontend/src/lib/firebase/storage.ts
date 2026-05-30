import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Compresses an image file using an HTML5 Canvas downscaler and uploads it to Firebase Storage.
 * Implements aggressive image compression before uploading.
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  const reader = new FileReader();
  
  const fileData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
  
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = fileData;
  });

  const canvas = document.createElement("canvas");
  const MAX_SIZE = 400;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX_SIZE) {
      height *= MAX_SIZE / width;
      width = MAX_SIZE;
    }
  } else {
    if (height > MAX_SIZE) {
      width *= MAX_SIZE / height;
      height = MAX_SIZE;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(img, 0, 0, width, height);
  
  // Aggressive compression
  const compressedDataUrl = canvas.toDataURL("image/webp", 0.7);

  // Upload to Firebase Storage
  const storageRef = ref(storage, `users/${uid}/profile_pic.webp`);
  await uploadString(storageRef, compressedDataUrl, "data_url");
  return await getDownloadURL(storageRef);
}
