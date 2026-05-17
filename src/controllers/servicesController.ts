import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function getServices(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(services);
  } catch (error) {
    console.error("Services fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch services" });
  }
}

export async function getAllServicesAdmin(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.json(services);
  } catch (error) {
    console.error("Admin services fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch all services" });
  }
}

export async function createService(req: Request, res: Response) {
  try {
    const { title, description, icon, price, features } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon: icon || null,
        price: price || null,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
      },
    });

    return res.status(201).json(service);
  } catch (error) {
    console.error("Service create error:", error);
    return res.status(500).json({ error: "Failed to create service" });
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const { id, title, description, icon, price, features, isActive, sortOrder } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(icon !== undefined && { icon }),
        ...(price !== undefined && { price }),
        ...(features !== undefined && { features: typeof features === "string" ? features : JSON.stringify(features) }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return res.json(service);
  } catch (error) {
    console.error("Service update error:", error);
    return res.status(500).json({ error: "Failed to update service" });
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const id = req.query.id as string;

    if (!id) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    await prisma.service.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Service delete error:", error);
    return res.status(500).json({ error: "Failed to delete service" });
  }
}
