import { FilterQuery } from "mongoose";
import { IShipping, Shipping } from "../models/Shipping";
import { NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import {
  AdminShippingQuery,
  CreateShippingInput,
  UpdateShippingInput,
} from "../validators/shippingValidator";

export async function calculateShippingCost(
  subtotal: number,
  region?: string,
): Promise<number> {
  const rules = await Shipping.find({ status: "active" }).sort({ rate: 1 }).lean();

  if (!rules.length) return 0;

  let matched: (typeof rules)[0] | undefined;

  if (region) {
    const normalizedRegion = region.trim().toLowerCase();
    matched = rules.find((rule) =>
      rule.regions.some((r) => r.trim().toLowerCase() === normalizedRegion),
    );
  }

  if (!matched) {
    matched = rules.find((rule) => !rule.regions.length) || rules[0];
  }

  if (matched.freeAbove !== undefined && subtotal >= matched.freeAbove) {
    return 0;
  }

  return matched.rate;
}

export async function listAdminShipping(query: AdminShippingQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter: FilterQuery<IShipping> = {};

  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Shipping.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Shipping.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function getShippingById(id: string) {
  const rule = await Shipping.findById(id).lean();
  if (!rule) throw new NotFoundError("Shipping rule not found");
  return rule;
}

export async function createShipping(input: CreateShippingInput) {
  return Shipping.create(input);
}

export async function updateShipping(id: string, input: UpdateShippingInput) {
  const rule = await Shipping.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).lean();

  if (!rule) throw new NotFoundError("Shipping rule not found");
  return rule;
}

export async function deleteShipping(id: string) {
  const rule = await Shipping.findByIdAndDelete(id);
  if (!rule) throw new NotFoundError("Shipping rule not found");
  return { id };
}
