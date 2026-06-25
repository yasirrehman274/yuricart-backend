import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import routes from "./routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: env.NODE_ENV === "production" ? 300 : 1000,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
