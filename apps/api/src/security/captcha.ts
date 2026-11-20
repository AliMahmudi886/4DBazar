import crypto from "node:crypto";
import { AppError } from "../errors.js";

const CAPTCHA_TTL_MS = 3 * 60 * 1000;
const CAPTCHA_TOLERANCE = 3;

interface CaptchaChallenge {
  target: number;
  y: number;
  expiresAt: number;
  consumed: boolean;
}

export interface CaptchaProofService {
  createChallenge(): { challenge_id: string; target: number; y: number; expires_in_seconds: number };
  createProof(challengeId: string, value: number): string;
  verifyProof(proof: string | undefined): void;
}

export function createCaptchaProofService(secret: string): CaptchaProofService {
  const challenges = new Map<string, CaptchaChallenge>();
  const usedProofs = new Set<string>();

  return {
    createChallenge() {
      cleanup();
      const challengeId = crypto.randomUUID();
      const challenge = {
        target: 38 + Math.floor(Math.random() * 31),
        y: 36 + Math.floor(Math.random() * 28),
        expiresAt: Date.now() + CAPTCHA_TTL_MS,
        consumed: false
      };
      challenges.set(challengeId, challenge);
      return {
        challenge_id: challengeId,
        target: challenge.target,
        y: challenge.y,
        expires_in_seconds: Math.floor(CAPTCHA_TTL_MS / 1000)
      };
    },

    createProof(challengeId, value) {
      cleanup();
      const challenge = challenges.get(challengeId);
      if (!challenge || challenge.consumed) {
        throw invalidCaptcha();
      }
      if (challenge.expiresAt < Date.now()) {
        throw expiredCaptcha();
      }
      if (Math.abs(value - challenge.target) > CAPTCHA_TOLERANCE) {
        throw invalidCaptcha();
      }
      challenge.consumed = true;
      const expiresAt = Date.now() + CAPTCHA_TTL_MS;
      const payload = `${challengeId}.${expiresAt}`;
      const signature = sign(payload, secret);
      return Buffer.from(`${payload}.${signature}`, "utf8").toString("base64url");
    },

    verifyProof(proof) {
      cleanup();
      if (!proof) throw requiredCaptcha();
      const decoded = Buffer.from(proof, "base64url").toString("utf8");
      const parts = decoded.split(".");
      if (parts.length !== 3) throw invalidCaptcha();
      const [challengeId, expiresAtText, signature] = parts;
      const payload = `${challengeId}.${expiresAtText}`;
      if (!challengeId || !expiresAtText || !signature || sign(payload, secret) !== signature) {
        throw invalidCaptcha();
      }
      if (Number(expiresAtText) < Date.now()) throw expiredCaptcha();
      const proofHash = crypto.createHash("sha256").update(proof).digest("hex");
      if (usedProofs.has(proofHash)) throw invalidCaptcha();
      usedProofs.add(proofHash);
    }
  };

  function cleanup() {
    const now = Date.now();
    for (const [id, challenge] of challenges.entries()) {
      if (challenge.expiresAt < now || challenge.consumed) challenges.delete(id);
    }
  }
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function invalidCaptcha() {
  return new AppError("captcha_invalid", "پاسخ پازل امنیتی درست نیست.", 400, {
    captcha: ["captcha معتبر نیست یا منقضی شده است."]
  });
}

function requiredCaptcha() {
  return new AppError("captcha_required", "برای ارسال کد، پازل امنیتی را حل کن.", 400, {
    captcha: ["captcha proof الزامی است."]
  });
}

function expiredCaptcha() {
  return new AppError("captcha_expired", "پازل امنیتی منقضی شده است؛ دوباره تلاش کن.", 400, {
    captcha: ["captcha منقضی شده است."]
  });
}
