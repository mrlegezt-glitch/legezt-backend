import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../utils/mailer";

const prisma = new PrismaClient();

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({ orderBy: { createdAt: "desc" } });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const { name, role, email, githubUrl, linkedinUrl, imageUrl } = req.body;
    const teamMember = await prisma.teamMember.create({
      data: { name, role, email, githubUrl, linkedinUrl, imageUrl },
    });

    // Trigger welcome email asynchronously
    if (teamMember.email) {
      sendWelcomeEmail(teamMember.email, teamMember.name, "team", {
        role: teamMember.role
      }).catch(err => console.error("Error dispatching team member welcome email:", err));
    }

    res.status(201).json(teamMember);
  } catch (error) {
    res.status(500).json({ error: "Failed to create team member" });
  }
};

export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { id, name, role, email, githubUrl, linkedinUrl, imageUrl } = req.body;
    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: { name, role, email, githubUrl, linkedinUrl, imageUrl },
    });
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ error: "Failed to update team member" });
  }
};

export const deleteTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await prisma.teamMember.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete team member" });
  }
};
