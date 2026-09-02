import apiClient from "@/lib/api-client";
import type {
  PrintConfig,
  PrintConfiguration,
  PrintModelFile,
  PrintOrder,
  PrintQuote,
} from "../types";

export type CreatePrintOrderPayload = PrintConfiguration & {
  shippingAddressId?: string;
  shippingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  customerNotes?: string;
  legalConsent: {
    accepted: true;
    policyVersion: string;
  };
};

export const threeDPrintingApi = {
  getConfig: async (): Promise<PrintConfig> => {
    const response = await apiClient.get("/api/3d-printing/config");
    return response.data.data;
  },

  uploadModels: async (files: File[]): Promise<PrintModelFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("models", file));
    const response = await apiClient.post("/api/3d-printing/files/batch", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    });
    return response.data.data;
  },

  calculateQuote: async (configuration: PrintConfiguration): Promise<PrintQuote> => {
    const response = await apiClient.post("/api/3d-printing/quote", configuration);
    return response.data.data;
  },

  calculatePreviewQuote: async (
    files: File[],
    configuration: Omit<PrintConfiguration, "fileIds">,
  ): Promise<PrintQuote> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("models", file));
    formData.append("configuration", JSON.stringify(configuration));
    const response = await apiClient.post("/api/3d-printing/preview-quote", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    });
    return response.data.data;
  },

  createOrder: async (
    payload: CreatePrintOrderPayload,
  ): Promise<{ order: PrintOrder; commerceOrderId: string }> => {
    const response = await apiClient.post("/api/3d-printing/orders", payload);
    return response.data.data;
  },

  listOrders: async (): Promise<PrintOrder[]> => {
    const response = await apiClient.get("/api/3d-printing/orders");
    return response.data.data;
  },

  getOrder: async (id: string): Promise<PrintOrder> => {
    const response = await apiClient.get(`/api/3d-printing/orders/${id}`);
    return response.data.data;
  },

  downloadModel: async (fileId: string, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/api/3d-printing/files/${fileId}/download`, {
      responseType: "blob",
      timeout: 120_000,
    });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
