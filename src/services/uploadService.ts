import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

interface UploadResult {
  url: string;
  publicId: string;
}

export function uploadBuffer(
  buffer: Buffer,
  folder: string,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (!result) {
          reject(new Error("Cloudinary upload returned empty result"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
  }
}

export async function deleteMultipleFromCloudinary(
  publicIds: string[],
): Promise<void> {
  const valid = publicIds.filter(Boolean);
  if (!valid.length) return;
  try {
    await cloudinary.api.delete_resources(valid);
  } catch (error) {
    console.error("Failed to delete Cloudinary images:", error);
  }
}

export const PRODUCT_IMAGE_FOLDER = "yuricart/products";
export const GALLERY_IMAGE_FOLDER = "yuricart/products/gallery";
export const CATEGORY_IMAGE_FOLDER = "yuricart/categories";
export const BRAND_IMAGE_FOLDER = "yuricart/brands";
export const BANNER_IMAGE_FOLDER = "yuricart/banners";
