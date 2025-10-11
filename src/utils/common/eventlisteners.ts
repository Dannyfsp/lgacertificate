import EventEmitter from 'events';
import { sendEmail } from './emailSender';
import { forgotPasswordTemp } from '../templates/forgotPasswordTemp';

const emitter = new EventEmitter();

emitter.on('forgot-password', async (data: { email: string; otp: string; name: string }) => {
  await sendEmail({
    email: data.email,
    subject: 'Forgot Password',
    message: await forgotPasswordTemp(data.email, data.otp, data.name),
  });
});

export default emitter;