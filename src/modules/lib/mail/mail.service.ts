import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { VerificationTemplate } from './templates/verification.template';
import { PasswordRecoveryTemplate } from './templates/password-recovery.template';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { DeactivateAccountTemplate } from './templates/deactivate-account.template';
import { AccountEraseTemplate } from './templates/account-erase.template';

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly confgService: ConfigService,
  ) {}

  public async sendVerificationToken(email: string, token: string) {
    const domain = this.confgService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html = await render(VerificationTemplate({ domain, token }));

    return this.sendMail(email, 'Account Verification', html);
  }

  public async sendPasswordResetToken(
    email: string,
    token: string,
    metadata: SessionMetadata,
  ) {
    const domain = this.confgService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html = await render(
      PasswordRecoveryTemplate({ domain, token, metadata }),
    );

    return this.sendMail(email, 'Password Recovery', html);
  }

  public async sendAccountDeactivationToken(
    email: string,
    token: string,
    metadata: SessionMetadata,
  ) {
    const html = await render(DeactivateAccountTemplate({ token, metadata }));

    return this.sendMail(email, 'Account Deactivation', html);
  }

  public async sendAccountEraseEmail(email: string) {
    const domain = this.confgService.getOrThrow<string>('ALLOWED_ORIGIN');
    
    const html = await render(AccountEraseTemplate({ domain }));

    return this.sendMail(email, 'Account Erase', html);
  }

  private sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
