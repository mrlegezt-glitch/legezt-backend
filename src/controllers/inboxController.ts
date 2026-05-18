import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/clerkAuth";
import { fetchLatestEmails } from "../utils/imapClient";

/**
 * Fetch latest incoming emails from Namecheap Private Email INBOX via IMAP
 */
export const getIncomingEmails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    console.log(`📥 Syncing INBOX (request limit: ${limit}) via IMAP...`);
    const emails = await fetchLatestEmails(limit);
    
    console.log(`📥 Successfully synchronized ${emails.length} emails from Namecheap server.`);
    res.json(emails);
  } catch (error: any) {
    console.error("IMAP Inbox synchronization failed:", error);
    
    // Provide a human-readable failure report
    const errMsg = error.message || "";
    if (errMsg.includes("authentication failed")) {
      return res.status(401).json({ error: "Failed to authenticate with Namecheap mail server. Please verify SMTP_PASS." });
    }
    
    res.status(500).json({ error: "Failed to synchronize incoming emails from server." });
  }
};
