import type { Metadata } from "next";
import { CreateTicketPage } from "@/features/support/components/CreateTicketPage";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Create a RoboRoot support ticket for order, shipping, return, product, or technical help.",
};

export default function Page() {
  return <CreateTicketPage />;
}
