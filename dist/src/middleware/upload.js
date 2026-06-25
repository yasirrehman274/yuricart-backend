"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImages = void 0;
exports.handleUploadError = handleUploadError;
const multer_1 = __importDefault(require("multer"));
const ApiError_1 = require("../utils/ApiError");
const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new ApiError_1.BadRequestError(`Invalid file type "${file.originalname}". Allowed: jpg, jpeg, png, webp.`));
        }
    },
    limits: { fileSize: MAX_SIZE },
});
exports.uploadProductImages = upload.fields([
    { name: "primaryImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
]);
function handleUploadError(err, _req, _res, next) {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError_1.BadRequestError("File too large. Maximum size is 5MB per image."));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return next(new ApiError_1.BadRequestError(`Unexpected form field: ${err.field}`));
        }
        return next(new ApiError_1.BadRequestError(err.message));
    }
    if (err)
        return next(err);
    next();
}
