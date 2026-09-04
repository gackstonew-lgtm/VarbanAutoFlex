import { siteConfig } from '../../config/site';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const EmailService = {
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || `${siteConfig.name} <notifications@verban.co.ke>`;

    if (!apiKey) {
      console.log(`[Email Service - Dev Mode] To: ${options.to} | Subject: ${options.subject}`);
      return { success: true, id: `dev-email-${Date.now()}` };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [options.to],
          subject: options.subject,
          html: options.html
        })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, id: data.id };
      }
      return { success: false, error: data.message || 'Failed to dispatch email' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown email error';
      return { success: false, error: errorMsg };
    }
  },

  generateReservationEmailHtml(buyerName: string, vehicleTitle: string, depositAmountKES: number, reservationId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #F7FAFF; margin: 0; padding: 20px; color: #10233F; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,56,188,0.08); border: 1px solid #D9EAFF; }
          .header { text-align: center; border-bottom: 2px solid #D9EAFF; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 800; color: #0038BC; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: #D0E6FD; color: #0751C9; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 13px; }
          .price { font-size: 24px; font-weight: 700; color: #1769E0; margin: 16px 0; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${siteConfig.name}</div>
            <p style="color: #64748B; margin-top: 4px;">${siteConfig.tagline}</p>
          </div>
          <span class="badge">RESERVATION CONFIRMED</span>
          <h2>Hello ${buyerName},</h2>
          <p>Your reservation for <strong>${vehicleTitle}</strong> has been successfully confirmed!</p>
          <div class="price">Deposit Paid: KES ${depositAmountKES.toLocaleString()}</div>
          <p><strong>Reservation Ref:</strong> ${reservationId}</p>
          <p>Our sales team at <strong>${siteConfig.name} Hub</strong> will contact you shortly to schedule your physical viewing or final transfer.</p>
          <div style="background: #F7FAFF; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <h4 style="margin-top:0;">Need assistance?</h4>
            <p style="margin-bottom:0;">Call us: ${siteConfig.contact.phone} | WhatsApp: ${siteConfig.contact.whatsapp}</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${siteConfig.legalName}. All rights reserved.<br/>
            ${siteConfig.contact.address}
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateSellerSubmissionEmailHtml(sellerName: string, vehicleTitle: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #F7FAFF; margin: 0; padding: 20px; color: #10233F; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 32px; border: 1px solid #D9EAFF; }
          .logo { font-size: 28px; font-weight: 800; color: #0038BC; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">${siteConfig.name}</div>
          <h2>Vehicle Submission Received</h2>
          <p>Dear ${sellerName},</p>
          <p>Thank you for submitting your <strong>${vehicleTitle}</strong> to ${siteConfig.name}.</p>
          <p>Our car-yard administration team is reviewing your details and logbook verification. Once verified, your listing will go live across Kenya's digital marketplace.</p>
          <p style="color: #64748B;">Status: <strong>Pending Review</strong></p>
        </div>
      </body>
      </html>
    `;
  }
};
