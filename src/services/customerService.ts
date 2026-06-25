import { FilterQuery } from "mongoose";
import { IUser, User } from "../models/User";
import { BadRequestError, NotFoundError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import {
  AdminCustomerQuery,
  UpdateCustomerStatusInput,
} from "../validators/authValidator";

export async function listCustomers(query: AdminCustomerQuery) {
  const { page, limit, skip } = getPagination(query);
  const filter: FilterQuery<IUser> = { role: "customer" };

  if (query.status) filter.status = query.status;

  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: "i" } },
      { email: { $regex: query.q, $options: "i" } },
      { phone: { $regex: query.q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(total, page, limit) };
}

export async function updateCustomerStatus(
  id: string,
  input: UpdateCustomerStatusInput,
) {
  const customer = await User.findOne({ _id: id, role: "customer" });
  if (!customer) throw new NotFoundError("Customer not found");

  if (customer.role === "admin") {
    throw new BadRequestError("Cannot modify admin users via customer endpoint");
  }

  customer.status = input.status;
  await customer.save();

  const { password: _password, ...safe } = customer.toObject();
  return safe;
}
