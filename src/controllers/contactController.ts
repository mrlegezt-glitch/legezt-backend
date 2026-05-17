import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function createContactMessage(req: Request, res: Response) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message },
    });

    return res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}

export async function getContactMessages(req: Request, res: Response) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(messages);
  } catch (error) {
    console.error("Messages fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function markMessageRead(req: Request, res: Response) {
  try {
    const { id, isRead } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Message ID is required" });
    }
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: !!isRead },
    });
    return res.json(message);
  } catch (error) {
    console.error("Message update error:", error);
    return res.status(500).json({ error: "Failed to update message" });
  }
}
