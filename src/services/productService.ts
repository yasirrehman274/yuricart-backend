import mongoose, { FilterQuery, SortOrder, Types } from "mongoose";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";
import { IProduct, Product, ProductImages } from "../models/Product";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseBoolean, parseSort } from "../utils/query";
import { ensureUniqueSlug } from "../utils/slug";
import { UploadFiles } from "../middleware/upload";
import { uploadBuffer, deleteFromCloudinary, deleteMultipleFromCloudinary, PRODUCT_IMAGE_FOLDER, GALLERY_IMAGE_FOLDER } from "./uploadService";
import {
  AdminProductQuery,
  CreateProductInput,
  PublicProductQuery,
  UpdateProductInput,
} from "../validators/productValidator";

const productPopulate = [
  { path: "category", select: "name slug image status" },
  { path: "brand", select: "name slug logo status" },
];

async function resolveCategoryRef(value?: string, activeOnly = true) {
  if (!value) return undefined;

  const query: FilterQuery<typeof Category> = Types.ObjectId.isValid(value)
    ? { _id: value }
    : { slug: value };

  if (activeOnly) query.status = "active";

  const category = await Category.findOne(query).select("_id");
  return category?._id;
}

async function resolveBrandRef(value?: string, activeOnly = true) {
  if (!value) return undefined;

  const query: FilterQuery<typeof Brand> = Types.ObjectId.isValid(value)
    ? { _id: value }
    : { slug: value };

  if (activeOnly) query.status = "active";

  const brand = await Brand.findOne(query).select("_id");
  return brand?._id;
}

async function buildProductFilter(
  query: PublicProductQuery | AdminProductQuery,
  options: { publicOnly?: boolean } = {},
) {
  const filter: FilterQuery<IProduct> = {};

  if (options.publicOnly) {
    filter.status = "active";
  } else if ("status" in query && query.status) {
    filter.status = query.status;
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  if (query.category) {
    const categoryId = await resolveCategoryRef(query.category, options.publicOnly);
    if (categoryId) filter.category = categoryId;
  }

  if (query.brand) {
    const brandId = await resolveBrandRef(query.brand, options.publicOnly);
    if (brandId) filter.brand = brandId;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  const featured = parseBoolean(query.featured);
  if (featured !== undefined) filter.featured = featured;

  const newArrival = parseBoolean(query.newArrival);
  if (newArrival !== undefined) filter.newArrival = newArrival;

  const bestSeller = parseBoolean(query.bestSeller);
  if (bestSeller !== undefined) filter.bestSeller = bestSeller;

  if (query.tags) {
    filter.tags = { $in: query.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
  }

  return filter;
}

async function uploadProductImages(
  files: UploadFiles | undefined,
  existingImages?: ProductImages,
): Promise<ProductImages> {
  const images: ProductImages = {
    primary: existingImages?.primary || { url: "" },
    gallery: existingImages?.gallery || [],
  };

  if (files?.primaryImage?.[0]) {
    if (existingImages?.primary?.publicId) {
      await deleteFromCloudinary(existingImages.primary.publicId);
    }
    const result = await uploadBuffer(files.primaryImage[0].buffer, PRODUCT_IMAGE_FOLDER);
    images.primary = result;
  }

  if (files?.galleryImages?.length) {
    const uploaded = await Promise.all(
      files.galleryImages.map((file) => uploadBuffer(file.buffer, GALLERY_IMAGE_FOLDER)),
    );
    images.gallery = [...images.gallery, ...uploaded];
  }

  return images;
}

export async function listPublicProducts(query: PublicProductQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = await buildProductFilter(query, { publicOnly: true });
  const defaultSort = (
    query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 }
  ) as Record<string, SortOrder>;
  const sort = parseSort(query.sort, defaultSort);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate(productPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function listAdminProducts(query: AdminProductQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter = await buildProductFilter(query, { publicOnly: false });
  const defaultSort = (
    query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 }
  ) as Record<string, SortOrder>;
  const sort = parseSort(query.sort, defaultSort);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate(productPopulate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await Product.findOne({ slug, status: "active" })
    .populate(productPopulate)
    .lean();

  if (!product) throw new NotFoundError("Product not found");
  return product;
}

export async function getAdminProductById(id: string) {
  const product = await Product.findById(id).populate(productPopulate).lean();
  if (!product) throw new NotFoundError("Product not found");
  return product;
}

export async function createProduct(
  input: Record<string, unknown>,
  files?: UploadFiles,
) {
  const slug = input.slug
    ? await ensureUniqueSlug(Product, input.slug as string)
    : await ensureUniqueSlug(Product, input.title as string);

  const images = await uploadProductImages(files);

  const product = await Product.create({
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

  return Product.findById(product._id).populate(productPopulate).lean();
}

export async function updateProduct(
  id: string,
  input: Record<string, unknown>,
  files?: UploadFiles,
  removedGalleryPublicIds: string[] = [],
) {
  const existing = await Product.findById(id);
  if (!existing) throw new NotFoundError("Product not found");

  let slug: string | undefined;
  if (input.slug) {
    slug = await ensureUniqueSlug(Product, input.slug as string, id);
  } else if (input.title && input.title !== existing.title) {
    slug = await ensureUniqueSlug(Product, input.title as string, id);
  }

  const existingImages = existing.images as ProductImages | undefined;
  let keptGallery = existingImages?.gallery || [];

  if (removedGalleryPublicIds.length > 0) {
    await deleteMultipleFromCloudinary(removedGalleryPublicIds);
    keptGallery = keptGallery.filter(
      (img) => !removedGalleryPublicIds.includes(img.publicId || ""),
    );
  }

  const images: ProductImages = {
    primary: existingImages?.primary || { url: "" },
    gallery: keptGallery,
  };

  if (files?.primaryImage?.[0]) {
    if (existingImages?.primary?.publicId) {
      await deleteFromCloudinary(existingImages.primary.publicId);
    }
    const result = await uploadBuffer(files.primaryImage[0].buffer, PRODUCT_IMAGE_FOLDER);
    images.primary = result;
  }

  if (files?.galleryImages?.length) {
    const uploaded = await Promise.all(
      files.galleryImages.map((file) => uploadBuffer(file.buffer, GALLERY_IMAGE_FOLDER)),
    );
    images.gallery = [...images.gallery, ...uploaded];
  }

  const updateData: Record<string, unknown> = {};
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
  return Product.findById(existing._id).populate(productPopulate).lean();
}

export async function deleteProduct(id: string) {
  const product = await Product.findById(id);
  if (!product) throw new NotFoundError("Product not found");

  const productImages = product.images as ProductImages | undefined;
  const publicIds: string[] = [];

  if (productImages?.primary?.publicId) {
    publicIds.push(productImages.primary.publicId);
  }
  if (productImages?.gallery?.length) {
    productImages.gallery.forEach((img) => {
      if (img.publicId) publicIds.push(img.publicId);
    });
  }

  if (publicIds.length > 0) {
    await deleteMultipleFromCloudinary(publicIds);
  }

  await Product.findByIdAndDelete(id);
  return { id };
}

export async function listProductsByCategorySlug(
  categorySlug: string,
  query: PublicProductQuery,
) {
  const category = await Category.findOne({ slug: categorySlug, status: "active" });
  if (!category) throw new NotFoundError("Category not found");

  return listPublicProducts({ ...query, category: category._id.toString() });
}

export async function getRelatedProducts(slug: string, limit = 8) {
  const product = await Product.findOne({ slug, status: "active" }).select("category brand _id");
  if (!product) throw new NotFoundError("Product not found");

  const filter: FilterQuery<IProduct> = {
    status: "active",
    _id: { $ne: product._id },
    $or: [
      ...(product.category ? [{ category: product.category }] : []),
      ...(product.brand ? [{ brand: product.brand }] : []),
    ],
  };

  if (!filter.$or?.length) delete filter.$or;

  const items = await Product.find(filter)
    .populate(productPopulate)
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return items;
}
