import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export async function getDocuments(req: Request, res: Response) {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(documents);
  } catch (error) {
    console.error("Documents fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const file = req.file;
    const { title, description, category, isPublic } = req.body;

    if (!file || !title) {
      return res.status(400).json({ error: "File and title are required" });
    }

    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        category: category || null,
        isPublic: isPublic === "false" ? false : true,
      },
    });

    return res.status(201).json(document);
  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({ error: "Failed to upload document" });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: "Document ID is required" });
    }
    await prisma.document.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    return res.status(500).json({ error: "Failed to delete document" });
  }
}
