import type { Metadata } from "next";
import type { LegalPolicy } from "@/features/legal/data/legal-policies";

export function legalMetadata(policy: LegalPolicy): Metadata {
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `https://roboroot.in/${policy.key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}` },
  };
}
