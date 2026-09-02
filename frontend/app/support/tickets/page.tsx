import type { Metadata } from "next";
import { TicketListPage } from "@/features/support/components/TicketListPage";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Track your RoboRoot support requests and continue conversations with the support team.",
};

export default function Page() {
  return <TicketListPage />;
}
