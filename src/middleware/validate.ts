import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/ApiError";

function validate<T>(
  schema: ZodSchema<T>,
  source: "body" | "query" | "params",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new BadRequestError("Validation failed", result.error.flatten().fieldErrors),
      );
    }

    if (source === "body") {
      req.body = result.data;
    } else if (source === "query") {
      req.query = result.data as Request["query"];
    } else {
      req.params = result.data as Request["params"];
    }

    next();
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return validate(schema, "body");
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return validate(schema, "query");
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return validate(schema, "params");
}
