import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export interface ReceivedEmail {
  uid: number;
  seq: number;
  from: string;
  to: string;
  subject: string;
  date: Date;
  text: string;
  html: string;
}

/**
 * Connects securely to the Namecheap Private Email IMAP server, 
 * locks the INBOX, and retrieves the latest incoming messages.
 */
export async function fetchLatestEmails(limit: number = 20): Promise<ReceivedEmail[]> {
  const host = process.env.SMTP_HOST || "mail.privateemail.com";
  const user = process.env.SMTP_USER || "info@mrlegezt.me";
  // Strip double quotes if parsed literally by dotenv
  const pass = (process.env.SMTP_PASS || "td@Hj2sTf#QftDh").replace(/"/g, "");

  const client = new ImapFlow({
    host,
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false
  });

  await client.connect();
  
  // Acquire a session lock on the INBOX
  const lock = await client.getMailboxLock("INBOX");
  const emailsList: ReceivedEmail[] = [];

  try {
    const mailbox = client.mailbox as any;
    if (mailbox && mailbox.exists > 0) {
      const exists = mailbox.exists;
      // Calculate index range to pull latest limit emails
      const start = Math.max(1, exists - limit + 1);
      const end = exists;

      // Fetch message source stream and envelopes (cast message iteration as any)
      for await (const message of (client.fetch(`${start}:${end}`, { envelope: true, source: true }) as any)) {
        const msg = message as any;
        try {
          const parsed = (await simpleParser(msg.source)) as any;
          const envelope = msg.envelope || {};
          
          const from = envelope.from?.map((f: any) => `${f.name || ""} <${f.address}>`.trim()).join(", ") 
                     || parsed.from?.text 
                     || "Unknown Sender";
                     
          const to = envelope.to?.map((t: any) => `${t.name || ""} <${t.address}>`.trim()).join(", ") 
                   || user;
                   
          const subject = envelope.subject || parsed.subject || "(No Subject)";
          const date = envelope.date || parsed.date || new Date();
          const text = parsed.text || "";
          const html = parsed.html || parsed.textAsHtml || "";

          emailsList.push({
            uid: msg.uid,
            seq: msg.seq,
            from,
            to,
            subject,
            date,
            text,
            html
          });
        } catch (parseError) {
          console.error(`Failed to parse raw source buffer for sequence ${msg.seq}:`, parseError);
        }
      }
    }
  } finally {
    // Release the INBOX lock and log out to prevent session/socket leaks
    lock.release();
    await client.logout();
  }

  // Reverse list so that the most recent incoming email is at the top of the feed
  return emailsList.reverse();
}
