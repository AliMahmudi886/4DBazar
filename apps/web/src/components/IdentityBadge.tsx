import { ShieldCheck } from "lucide-react";

export default function IdentityBadge({ verified, compact = false }: { verified?: boolean | undefined; compact?: boolean | undefined }) {
  if (!verified) return null;
  return <span className={compact ? "identity-badge compact" : "identity-badge"} title="هویت این کاربر توسط 4D تأیید شده است." aria-label="هویت تأیید شده"><ShieldCheck size={compact ? 13 : 15} /> هویت تأیید شده</span>;
}
