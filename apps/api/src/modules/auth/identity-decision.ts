/** Build audit timestamps without erasing a previous successful verification. */
export function identityDecisionFields(
  decision: "approve" | "reject" | "revoke",
  reviewedAt: Date,
  reason?: string,
) {
  return {
    status: decision === "approve" ? "verified" : "rejected",
    rejection_reason: decision === "approve" ? null : reason?.trim().slice(0, 500)
      || (decision === "revoke" ? "تأیید هویت لغو شد." : "مدرک قابل تأیید نبود."),
    reviewed_at: reviewedAt,
    ...(decision === "approve" ? { verified_at: reviewedAt } : {}),
    revoked_at: decision === "revoke" ? reviewedAt : null,
    updated_at: reviewedAt,
  };
}
