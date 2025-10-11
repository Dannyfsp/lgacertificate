import nodemailer, { TransportOptions } from 'nodemailer';
import { config } from '../../config/app';

type TransportOptionsType = TransportOptions & {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
};

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    type?: string;
    disposition: string;
  }>;
}

const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: config.mail.HOST as string,
    port: Number(config.mail.PORT),
    auth: {
      user: config.mail.USER_EMAIL as string,
      pass: config.mail.USER_PASSWORD as string,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as TransportOptionsType);

  try {
    const message = {
      from: `${config.mail.FROM_NAME} <${config.mail.USER_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.message,
      attachments: options.attachments || undefined
    };

    console.log(config.mail);

    const info = await transporter.sendMail(message);
    console.info('Message sent: %s', info.response);
    return info;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export { sendEmail };
