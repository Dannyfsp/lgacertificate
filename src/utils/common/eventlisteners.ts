import EventEmitter from 'events';
import { sendEmail } from './emailSender';
import { forgotPasswordTemp } from '../templates/forgotPasswordTemp';
import { createAdminTemp } from '../templates/createAdminTemp';

const emitter = new EventEmitter();

emitter.on('forgot-password', async (data: { email: string; otp: string; name: string }) => {
  await sendEmail({
    email: data.email,
    subject: 'Forgot Password',
    message: await forgotPasswordTemp(data.email, data.otp, data.name),
  });
});

emitter.on('send-admin-invitation', async (data: { email: string; name: string, password: string }) => {
  await sendEmail({
    email: data.email,
    subject: 'Invitation to join LGA Certificate Proj',
    message: await createAdminTemp(data.email, data.name, data.password),
  });
});

export default emitter;