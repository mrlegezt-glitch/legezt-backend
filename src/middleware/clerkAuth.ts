import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Cache to keep verified admin user IDs in memory for extreme speed
const adminUserCache = new Map<string, { email: string; expiresAt: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // Cache verified status for 15 minutes

const client = jwksClient({
  jwksUri: `https://safe-bird-75.clerk.accounts.dev/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export async function verifyClerkToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const now = Date.now();
    const cached = adminUserCache.get(userId);

    // If verified admin status is cached and not expired, pass through immediately!
    if (cached && cached.expiresAt > now) {
      req.user = { userId, email: cached.email };
      return next();
    }

    try {
      // Query Clerk Backend API to retrieve user details securely
      const clerkSecretKey = process.env.CLERK_SECRET_KEY || "sk_test_pZBSv24RnOFTn2LcgcMp80W5tME0f16MV9ZJ1I8aok";
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          Accept: "application/json"
        }
      });

      if (!clerkResponse.ok) {
        return res.status(401).json({ error: "Failed to verify user with auth provider" });
      }

      const userData: any = await clerkResponse.json();
      const emailAddresses: any[] = userData.email_addresses || [];
      const userEmails = emailAddresses.map((e: any) => e.email_address);

      const authorizedEmails = ["mdjibjibran@gmail.com", "mdjbjibran@gmail.com"];
      const matchedEmail = userEmails.find((email: string) => authorizedEmails.includes(email));

      if (!matchedEmail) {
        return res.status(403).json({ error: "Admin authorization strictly required" });
      }

      // Cache the authorized admin status
      adminUserCache.set(userId, {
        email: matchedEmail,
        expiresAt: now + CACHE_DURATION
      });

      req.user = { userId, email: matchedEmail };
      next();
    } catch (error) {
      console.error("Clerk token verification error:", error);
      return res.status(500).json({ error: "Internal server authentication error" });
    }
  });
}

export async function verifyAnyClerkToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    try {
      // Query Clerk Backend API to retrieve user details securely
      const clerkSecretKey = process.env.CLERK_SECRET_KEY || "sk_test_pZBSv24RnOFTn2LcgcMp80W5tME0f16MV9ZJ1I8aok";
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          Accept: "application/json"
        }
      });

      if (!clerkResponse.ok) {
        return res.status(401).json({ error: "Failed to verify user with auth provider" });
      }

      const userData: any = await clerkResponse.json();
      const emailAddresses: any[] = userData.email_addresses || [];
      const userEmails = emailAddresses.map((e: any) => e.email_address);
      const email = userEmails[0] || ""; // Get primary email
      const name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "User";

      req.user = { userId, email };
      // Attach name to request object for downstream use
      (req as any).userName = name;
      next();
    } catch (error) {
      console.error("Clerk token verification error:", error);
      return res.status(500).json({ error: "Internal server authentication error" });
    }
  });
}

