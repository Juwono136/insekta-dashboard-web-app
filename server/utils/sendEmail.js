import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", // Default Gmail
    port: process.env.SMTP_PORT || 587,
    secure: false, // True untuk port 465, false untuk lainnya
    auth: {
      user: process.env.EMAIL_USER, // Email pengirim (dari .env)
      pass: process.env.EMAIL_PASS, // App Password (dari .env)
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || "Insekta Support"} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
