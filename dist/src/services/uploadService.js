"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GALLERY_IMAGE_FOLDER = exports.PRODUCT_IMAGE_FOLDER = void 0;
exports.uploadBuffer = uploadBuffer;
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.deleteMultipleFromCloudinary = deleteMultipleFromCloudinary;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
function uploadBuffer(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            else if (!result) {
                reject(new Error("Cloudinary upload returned empty result"));
            }
            else {
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
    });
}
async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary_1.default.uploader.destroy(publicId);
    }
    catch (error) {
        console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    }
}
async function deleteMultipleFromCloudinary(publicIds) {
    const valid = publicIds.filter(Boolean);
    if (!valid.length)
        return;
    try {
        await cloudinary_1.default.api.delete_resources(valid);
    }
    catch (error) {
        console.error("Failed to delete Cloudinary images:", error);
    }
}
exports.PRODUCT_IMAGE_FOLDER = "yuricart/products";
exports.GALLERY_IMAGE_FOLDER = "yuricart/products/gallery";
