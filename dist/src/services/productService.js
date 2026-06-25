"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicProducts = listPublicProducts;
exports.listAdminProducts = listAdminProducts;
exports.getPublicProductBySlug = getPublicProductBySlug;
exports.getAdminProductById = getAdminProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.listProductsByCategorySlug = listProductsByCategorySlug;
exports.getRelatedProducts = getRelatedProducts;
const mongoose_1 = require("mongoose");
const Brand_1 = require("../models/Brand");
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const query_1 = require("../utils/query");
const slug_1 = require("../utils/slug");
const uploadService_1 = require("./uploadService");
const productPopulate = [
    { path: "category", select: "name slug image status" },
    { path: "brand", select: "name slug logo status" },
];
async function resolveCategoryRef(value, activeOnly = true) {
    if (!value)
        return undefined;
    const query = mongoose_1.Types.ObjectId.isValid(value)
        ? { _id: value }
        : { slug: value };
    if (activeOnly)
        query.status = "active";
    const category = await Category_1.Category.findOne(query).select("_id");
    return category?._id;
}
async function resolveBrandRef(value, activeOnly = true) {
    if (!value)
        return undefined;
    const query = mongoose_1.Types.ObjectId.isValid(value)
        ? { _id: value }
        : { slug: value };
    if (activeOnly)
        query.status = "active";
    const brand = await Brand_1.Brand.findOne(query).select("_id");
    return brand?._id;
}
async function buildProductFilter(query, options = {}) {
    const filter = {};
    if (options.publicOnly) {
        filter.status = "active";
    }
    else if ("status" in query && query.status) {
        filter.status = query.status;
    }
    if (query.q) {
        filter.$text = { $search: query.q };
    }
    if (query.category) {
        const categoryId = await resolveCategoryRef(query.category, options.publicOnly);
        if (categoryId)
            filter.category = categoryId;
    }
    if (query.brand) {
        const brandId = await resolveBrandRef(query.brand, options.publicOnly);
        if (brandId)
            filter.brand = brandId;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filter.price = {};
        if (query.minPrice !== undefined)
            filter.price.$gte = query.minPrice;
        if (query.maxPrice !== undefined)
            filter.price.$lte = query.maxPrice;
    }
    const featured = (0, query_1.parseBoolean)(query.featured);
    if (featured !== undefined)
        filter.featured = featured;
    const newArrival = (0, query_1.parseBoolean)(query.newArrival);
    if (newArrival !== undefined)
        filter.newArrival = newArrival;
    const bestSeller = (0, query_1.parseBoolean)(query.bestSeller);
    if (bestSeller !== undefined)
        filter.bestSeller = bestSeller;
    if (query.tags) {
        filter.tags = { $in: query.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    }
    return filter;
}
async function uploadProductImages(files, existingImages) {
    const images = {
        primary: existingImages?.primary || { url: "" },
        gallery: existingImages?.gallery || [],
    };
    if (files?.primaryImage?.[0]) {
        if (existingImages?.primary?.publicId) {
            await (0, uploadService_1.deleteFromCloudinary)(existingImages.primary.publicId);
        }
        const result = await (0, uploadService_1.uploadBuffer)(files.primaryImage[0].buffer, uploadService_1.PRODUCT_IMAGE_FOLDER);
        images.primary = result;
    }
    if (files?.galleryImages?.length) {
        const uploaded = await Promise.all(files.galleryImages.map((file) => (0, uploadService_1.uploadBuffer)(file.buffer, uploadService_1.GALLERY_IMAGE_FOLDER)));
        images.gallery = [...images.gallery, ...uploaded];
    }
    return images;
}
async function listPublicProducts(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = await buildProductFilter(query, { publicOnly: true });
    const defaultSort = (query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 });
    const sort = (0, query_1.parseSort)(query.sort, defaultSort);
    const [items, total] = await Promise.all([
        Product_1.Product.find(filter)
            .populate(productPopulate)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product_1.Product.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function listAdminProducts(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const filter = await buildProductFilter(query, { publicOnly: false });
    const defaultSort = (query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 });
    const sort = (0, query_1.parseSort)(query.sort, defaultSort);
    const [items, total] = await Promise.all([
        Product_1.Product.find(filter)
            .populate(productPopulate)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product_1.Product.countDocuments(filter),
    ]);
    return { items, meta: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
}
async function getPublicProductBySlug(slug) {
    const product = await Product_1.Product.findOne({ slug, status: "active" })
        .populate(productPopulate)
        .lean();
    if (!product)
        throw new ApiError_1.NotFoundError("Product not found");
    return product;
}
async function getAdminProductById(id) {
    const product = await Product_1.Product.findById(id).populate(productPopulate).lean();
    if (!product)
        throw new ApiError_1.NotFoundError("Product not found");
    return product;
}
async function createProduct(input, files) {
    const slug = input.slug
        ? await (0, slug_1.ensureUniqueSlug)(Product_1.Product, input.slug)
        : await (0, slug_1.ensureUniqueSlug)(Product_1.Product, input.title);
    const images = await uploadProductImages(files);
    const product = await Product_1.Product.create({
        title: input.title,
        slug,
        description: input.description,
        shortDescription: input.shortDescription,
        price: input.price,
        salePrice: input.salePrice,
        sku: input.sku,
        stock: input.stock,
        category: input.category || undefined,
        brand: input.brand || undefined,
        images,
        tags: input.tags,
        colors: input.colors,
        sizes: input.sizes,
        variants: input.variants,
        status: input.status,
        featured: input.featured,
        newArrival: input.newArrival,
        bestSeller: input.bestSeller,
        ribbon: input.ribbon,
        currency: input.currency,
    });
    return Product_1.Product.findById(product._id).populate(productPopulate).lean();
}
async function updateProduct(id, input, files, removedGalleryPublicIds = []) {
    const existing = await Product_1.Product.findById(id);
    if (!existing)
        throw new ApiError_1.NotFoundError("Product not found");
    let slug;
    if (input.slug) {
        slug = await (0, slug_1.ensureUniqueSlug)(Product_1.Product, input.slug, id);
    }
    else if (input.title && input.title !== existing.title) {
        slug = await (0, slug_1.ensureUniqueSlug)(Product_1.Product, input.title, id);
    }
    const existingImages = existing.images;
    let keptGallery = existingImages?.gallery || [];
    if (removedGalleryPublicIds.length > 0) {
        await (0, uploadService_1.deleteMultipleFromCloudinary)(removedGalleryPublicIds);
        keptGallery = keptGallery.filter((img) => !removedGalleryPublicIds.includes(img.publicId || ""));
    }
    const images = {
        primary: existingImages?.primary || { url: "" },
        gallery: keptGallery,
    };
    if (files?.primaryImage?.[0]) {
        if (existingImages?.primary?.publicId) {
            await (0, uploadService_1.deleteFromCloudinary)(existingImages.primary.publicId);
        }
        const result = await (0, uploadService_1.uploadBuffer)(files.primaryImage[0].buffer, uploadService_1.PRODUCT_IMAGE_FOLDER);
        images.primary = result;
    }
    if (files?.galleryImages?.length) {
        const uploaded = await Promise.all(files.galleryImages.map((file) => (0, uploadService_1.uploadBuffer)(file.buffer, uploadService_1.GALLERY_IMAGE_FOLDER)));
        images.gallery = [...images.gallery, ...uploaded];
    }
    const updateData = {};
    const fields = [
        "title", "description", "shortDescription", "price", "salePrice",
        "sku", "stock", "tags", "colors", "sizes", "variants",
        "status", "featured", "newArrival", "bestSeller", "ribbon", "currency",
    ];
    for (const field of fields) {
        if (field in input) {
            updateData[field] = input[field];
        }
    }
    Object.assign(existing, {
        ...updateData,
        ...(slug ? { slug } : {}),
        images,
        category: input.category === null ? undefined : input.category ?? existing.category,
        brand: input.brand === null ? undefined : input.brand ?? existing.brand,
    });
    await existing.save();
    return Product_1.Product.findById(existing._id).populate(productPopulate).lean();
}
async function deleteProduct(id) {
    const product = await Product_1.Product.findById(id);
    if (!product)
        throw new ApiError_1.NotFoundError("Product not found");
    const productImages = product.images;
    const publicIds = [];
    if (productImages?.primary?.publicId) {
        publicIds.push(productImages.primary.publicId);
    }
    if (productImages?.gallery?.length) {
        productImages.gallery.forEach((img) => {
            if (img.publicId)
                publicIds.push(img.publicId);
        });
    }
    if (publicIds.length > 0) {
        await (0, uploadService_1.deleteMultipleFromCloudinary)(publicIds);
    }
    await Product_1.Product.findByIdAndDelete(id);
    return { id };
}
async function listProductsByCategorySlug(categorySlug, query) {
    const category = await Category_1.Category.findOne({ slug: categorySlug, status: "active" });
    if (!category)
        throw new ApiError_1.NotFoundError("Category not found");
    return listPublicProducts({ ...query, category: category._id.toString() });
}
async function getRelatedProducts(slug, limit = 8) {
    const product = await Product_1.Product.findOne({ slug, status: "active" }).select("category brand _id");
    if (!product)
        throw new ApiError_1.NotFoundError("Product not found");
    const filter = {
        status: "active",
        _id: { $ne: product._id },
        $or: [
            ...(product.category ? [{ category: product.category }] : []),
            ...(product.brand ? [{ brand: product.brand }] : []),
        ],
    };
    if (!filter.$or?.length)
        delete filter.$or;
    const items = await Product_1.Product.find(filter)
        .populate(productPopulate)
        .sort({ featured: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    return items;
}
