import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFaculties = async (req: Request, res: Response) => {
  try {
    const faculties = await prisma.faculty.findMany({ orderBy: { createdAt: "desc" } });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { name, department, designation, email, imageUrl } = req.body;
    const faculty = await prisma.faculty.create({
      data: { name, department, designation, email, imageUrl },
    });
    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to create faculty" });
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const { id, name, department, designation, email, imageUrl } = req.body;
    const faculty = await prisma.faculty.update({
      where: { id },
      data: { name, department, designation, email, imageUrl },
    });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to update faculty" });
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.faculty.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete faculty" });
  }
};
