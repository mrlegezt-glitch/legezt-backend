import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../utils/mailer";

const prisma = new PrismaClient();

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, enrollmentNo, course, batchYear, email } = req.body;
    const student = await prisma.student.create({
      data: { name, enrollmentNo, course, batchYear, email },
    });
    
    // Trigger welcome email asynchronously
    if (student.email) {
      sendWelcomeEmail(student.email, student.name, "student", {
        course: student.course,
        batchYear: student.batchYear,
        enrollmentNo: student.enrollmentNo
      }).catch(err => console.error("Error dispatching student welcome email:", err));
    }

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student" });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id, name, enrollmentNo, course, batchYear, email } = req.body;
    const student = await prisma.student.update({
      where: { id },
      data: { name, enrollmentNo, course, batchYear, email },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.student.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
};
