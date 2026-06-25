import { Types } from "mongoose";

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SlugLookupModel {
  findOne(filter: Record<string, unknown>): {
    select(fields: string): { lean(): Promise<{ _id: unknown } | null> };
  };
}

export async function ensureUniqueSlug(
  model: SlugLookupModel,
  baseText: string,
  excludeId?: Types.ObjectId | string,
): Promise<string> {
  const baseSlug = generateSlug(baseText) || "item";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await model.findOne(query).select("_id").lean();
    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}
