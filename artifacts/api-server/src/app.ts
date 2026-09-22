import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attaches the Clerk Auth object to every request (as req.auth) when a
// session JWT is present. It does NOT reject unauthenticated requests by
// itself — routes that need a signed-in user use the requireGym middleware
// (see middlewares/require-gym.ts), which calls getAuth(req) and returns
// 401 if there's no user. /api/healthz stays public because it never uses
// requireGym.
app.use(clerkMiddleware());

app.use("/api", router);

export default app;
