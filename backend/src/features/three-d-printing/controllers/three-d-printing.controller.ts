import type { Request, Response } from "express";
import type {
  PrintFinish,
  PrintOrderStatus,
  PrintQuality,
} from "../../../generated/prisma/client.js";
import * as printService from "../services/three-d-printing.service.js";

function sendError(res: Response, error: unknown) {
  const typedError = error as Error & { statusCode?: number };
  res.status(typedError.statusCode ?? 500).json({
    success: false,
    error: typedError.message || "3D printing request failed",
  });
}

function quoteInput(req: Request): printService.PrintQuoteInput {
  return {
    userId: req.user!.userId,
    fileId: req.body.fileId,
    materialId: req.body.materialId,
    color: req.body.color,
    quality: req.body.quality as PrintQuality,
    finish: req.body.finish as PrintFinish,
    infillPercent: req.body.infillPercent,
    quantity: req.body.quantity,
  };
}

export async function getPrintConfigHandler(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await printService.getPrintPricingSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    sendError(res, error);
  }
}

export async function uploadModelHandler(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: "Select an STL or OBJ model file" });
    return;
  }
  try {
    const file = await printService.createModelFile(req.user!.userId, req.file);
    res.status(201).json({ success: true, data: file });
  } catch (error) {
    sendError(res, error);
  }
}

export async function calculateQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const quote = await printService.calculatePrintQuote(quoteInput(req));
    res.json({ success: true, data: quote });
  } catch (error) {
    sendError(res, error);
  }
}

export async function createPrintOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const order = await printService.createPrintOrder({
      ...quoteInput(req),
      shippingAddressId: req.body.shippingAddressId,
      shippingAddress: req.body.shippingAddress,
      customerNotes: req.body.customerNotes,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getUserPrintOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const orders = await printService.getUserPrintOrders(req.user!.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getPrintOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
    const order = await printService.getPrintOrderById(
      req.params.id as string,
      req.user!.userId,
      isAdmin,
    );
    res.json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
}

export async function downloadModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
    const download = await printService.getModelFileDownload(
      req.params.id as string,
      req.user!.userId,
      isAdmin,
    );
    res.setHeader("Cache-Control", "private, no-store");
    if (download.access.type === "redirect") {
      res.redirect(302, download.access.url);
      return;
    }
    res.download(download.access.absolutePath, download.fileName);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getAdminPrintOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await printService.getAdminPrintOrders({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 25,
      ...(req.query.status ? { status: req.query.status as PrintOrderStatus } : {}),
      ...(req.query.search ? { search: req.query.search as string } : {}),
    });
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateAdminPrintOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const order = await printService.updateAdminPrintOrder(
      req.params.id as string,
      req.body,
      req.user!.email,
    );
    res.json({ success: true, data: order, message: "3D print order updated" });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getAdminPrintSettingsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await printService.getPrintPricingSettings(true);
    res.json({ success: true, data: settings });
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateAdminPrintSettingsHandler(req: Request, res: Response): Promise<void> {
  try {
    const settings = await printService.updatePrintPricingSettings(req.body);
    res.json({
      success: true,
      data: settings,
      message: "3D printing pricing updated",
    });
  } catch (error) {
    sendError(res, error);
  }
}
