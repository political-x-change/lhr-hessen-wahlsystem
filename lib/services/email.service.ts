import { Resend } from "resend";
import { IEmailService } from "../types";

export class EmailService implements IEmailService {
  private resend: Resend;

  constructor(
    private readonly apiKey: string,
    private readonly appUrl: string,
    private readonly fromEmail: string = "LHR Hessen Wahlsystem <poxc@lgll.dev>"
  ) {
    if (!apiKey) {
      throw new Error("Resend API key is required");
    }
    this.resend = new Resend(apiKey);
  }

  async sendVotingEmail(email: string, token: string): Promise<void> {
    const votingLink = `${this.appUrl}/vote?token=${token}`;

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject: "Ihr persönlicher Wahllink",
        html: this.generateEmailHtml(votingLink),
      });

      if (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Email error:", error);
      throw error;
    }
  }

  private generateEmailHtml(votingLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Willkommen zum LHR Hessen Wahlsystem</h1>
        <p>Sie haben sich für das Wahlsystem registriert.</p>
        <p>Bitte klicken Sie auf den folgenden Link, um Ihre Stimme abzugeben:</p>
        <a href="${votingLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Zur Abstimmung
        </a>
        <p style="color: #666; font-size: 14px;">
          Dieser Link ist einmalig gültig und kann nur für eine Abstimmung verwendet werden.
        </p>
        <p style="color: #666; font-size: 14px;">
          Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Diese E-Mail wurde im Rahmen des DSGVO-konformen LHR Hessen Wahlsystems versendet.
        </p>
      </div>
    `;
  }
}

// Factory function for creating email service with environment variables
export function createEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  return new EmailService(apiKey, appUrl);
}
