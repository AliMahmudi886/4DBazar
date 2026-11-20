import type { FastifyReply, FastifyRequest } from "fastify";
import type { Kysely } from "kysely";
import type { Database } from "../db/types.js";
import { AppError } from "../errors.js";
import { findUserBySessionToken, hashSessionToken } from "../modules/auth/repository.js";

export interface AuthenticatedUser {
  id: string;
  roles: readonly string[];
  mobileVerified: boolean;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export function attachAuthenticatedUser(db: Kysely<Database>, sessionSecret: string, allowHeaderFallback: boolean) {
  return async (request: FastifyRequest) => {
    const authorization = request.headers.authorization?.toString();
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";

    if (token) {
      try {
        const user = await findUserBySessionToken(db, hashSessionToken(token, sessionSecret));
        if (user) {
          request.user = {
            id: user.id,
            roles: user.roles,
            mobileVerified: Boolean(user.phone_verified_at)
          };
          return;
        }
      } catch {
        return;
      }
    }

    if (allowHeaderFallback) {
      await attachStubUser(request);
    }
  };
}

export async function attachStubUser(request: FastifyRequest) {
  const userId = request.headers["x-4d-user-id"]?.toString();
  if (!userId) {
    return;
  }

  request.user = {
    id: userId,
    roles: request.headers["x-4d-roles"]?.toString().split(",").filter(Boolean) ?? ["user"],
    mobileVerified: request.headers["x-4d-mobile-verified"] === "true"
  };
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.user) {
    throw new AppError("unauthorized", "برای انجام این عملیات باید وارد شوید.", 401);
  }
}

export async function requireMobileVerified(request: FastifyRequest, _reply: FastifyReply) {
  await requireAuth(request, _reply);
  if (!request.user?.mobileVerified) {
    throw new AppError("forbidden", "برای ثبت محتوا باید شماره موبایل تایید شده باشد.", 403);
  }
}

export function requireRole(role: "moderator" | "admin") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    if (!request.user?.roles.includes(role)) {
      throw new AppError("forbidden", "دسترسی لازم برای این عملیات وجود ندارد.", 403);
    }
  };
}
