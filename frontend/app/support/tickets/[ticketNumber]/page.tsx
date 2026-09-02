import { Suspense } from "react";
import { TicketDetailPage } from "@/features/support/components/TicketDetailPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[65vh] bg-[#f7f8f8]" />}>
      <TicketDetailPage />
    </Suspense>
  );
}
