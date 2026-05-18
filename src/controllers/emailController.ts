import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/clerkAuth";
import { sendWelcomeBackEmail, sendCustomEmail } from "../utils/mailer";

/**
 * Handle user login event to trigger welcome back notification
 */
export const handleLoginEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = req.user?.email;
    const name = (req as any).userName || "User";

    if (!email) {
      return res.status(400).json({ error: "Email address not found in session" });
    }

    // Trigger welcome back email asynchronously
    sendWelcomeBackEmail(email, name)
      .then(() => console.log(`📧 Dispatch successful: Welcome Back email sent to ${email}`))
      .catch((err) => console.error("Error dispatching Welcome Back email:", err));

    res.json({ success: true, message: "Welcome Back event processed successfully" });
  } catch (error) {
    console.error("Login event processing failed:", error);
    res.status(500).json({ error: "Failed to process login event" });
  }
};

/**
 * Handle custom administrative email broadcast from Admin Console
 */
export const handleAdminBroadcast = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Recipient, subject, and email body are required fields" });
    }

    await sendCustomEmail(to, subject, body);
    console.log(`📧 Admin Broadcast dispatched successfully to: ${to}`);

    res.json({ success: true, message: "Email broadcast sent successfully" });
  } catch (error) {
    console.error("Admin broadcast dispatch failed:", error);
    res.status(500).json({ error: "Failed to send email broadcast" });
  }
};
