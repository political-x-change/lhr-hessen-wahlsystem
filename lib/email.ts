import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVotingEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const votingLink = `${appUrl}/vote?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "LHR Hessen Wahlsystem <poxc@lgll.dev>", // Replace with your verified domain
      to: [email],
      subject: "Ihr persönlicher Wahllink",
      html: `
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
      `,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send email");
  }
}
