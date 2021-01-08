import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log('options', options);
    // this.sendEmail('testing', 'test');
  }

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `hong from <mailgun@${this.options.domain}>`);
    form.append('to', `fire@dumy.co.kr`);
    form.append('subject', subject);
    form.append('template', 'grgrkjgrkjgr');
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`, // Authorization base64 인코딩
        },
        method: 'POST',
        body: form,
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'grgrkjgrkjgr', [
      {
        key: 'code',
        value: code,
      },
      { key: 'username', value: email },
    ]);
  }
}