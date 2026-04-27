import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendWithSendGrid = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.EMAIL_USER,
    subject,
    html
  };
  
  return await sgMail.send(msg);
};