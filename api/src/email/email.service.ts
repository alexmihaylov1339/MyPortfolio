import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const FROM_EMAIL = process.env.EMAIL_FROM || 'aleksandermihaylov@gmail.com';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    const appPassword = process.env.GMAIL_APP_PASSWORD;
    if (!appPassword || !appPassword.trim()) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: FROM_EMAIL,
          pass: appPassword.trim(),
        },
      });
    }
    return this.transporter;
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
    const transport = this.getTransporter();
    if (!transport) {
      return false;
    }

    await transport.sendMail({
      from: `MyPortfolio <${FROM_EMAIL}>`,
      to,
      subject: 'Reset your MyPortfolio password',
      text: `You requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThe link expires in 1 hour.`,
      html: `<p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>The link expires in 1 hour.</p>`,
    });
    return true;
  }
}
