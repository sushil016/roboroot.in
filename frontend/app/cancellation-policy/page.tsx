import { LegalPolicyPage } from "@/features/legal/components/LegalPolicyPage";
import { legalPolicies } from "@/features/legal/data/legal-policies";
import { legalMetadata } from "@/features/legal/metadata";

const policy = legalPolicies.cancellationPolicy;
export const metadata = legalMetadata(policy);

export default function CancellationPolicyPage() {
  return <LegalPolicyPage policy={policy} />;
}
