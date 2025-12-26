import { UploadedImage } from "@/components/new-proptery-form";
import { storage } from "@/firebase/client";
import { clsx, type ClassValue } from "clsx";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const uploadImageAndGetUrl = async (
  file: File,
  propertyId: string
): Promise<UploadedImage> => {
  // Create unique filename to avoid collisions
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const fileName = `image_${timestamp}.${fileExtension}`;
  const path = `properties/${propertyId}/${fileName}`;

  const storageRef = ref(storage, path);

  // Upload the file
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Return a promise that resolves with the download URL
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      null, // You can add progress tracking here if needed
      (error) => {
        console.error("Upload error:", error);
        reject(new Error(`Failed to upload image: ${error.message}`));
      },
      async () => {
        try {
          // Get download URL after successful upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Image uploaded, URL:", downloadURL);

          resolve({
            url: downloadURL,
            path: path,
            name: file.name,
          });
        } catch (error: any) {
          reject(new Error(`Failed to get download URL: ${error.message}`));
        }
      }
    );
  });
};
export const uploadAllImages = async (
  files: File[],
  propertyId: string
): Promise<UploadedImage[]> => {
  const uploadPromises = files.map((file) =>
    uploadImageAndGetUrl(file, propertyId)
  );

  // Use Promise.all to upload all images in parallel
  const uploadedImages = await Promise.all(uploadPromises);
  return uploadedImages;
};
