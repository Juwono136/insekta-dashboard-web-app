// Gaya CSS Inline untuk Email (Email client butuh inline styles)
const styles = {
  container:
    "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;",
  header: "background-color: #0056b3; padding: 20px; text-align: center;",
  headerText: "color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;",
  content: "padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6;",
  button:
    "display: inline-block; padding: 12px 24px; background-color: #ff9900; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;",
  footer:
    "background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;",
  warning:
    "background-color: #fff3cd; border: 1px solid #ffeeba; padding: 10px; margin-top: 20px; font-size: 14px; color: #856404; border-radius: 4px;",
};

// 1. Template Dasar (Wrapper)
const wrapEmail = (content) => {
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerText}">INSEKTA</h1>
      </div>
      <div style="${styles.content}">
        ${content}
      </div>
      <div style="${styles.footer}">
        <p>&copy; ${new Date().getFullYear()} PT Insekta Fokustama. All rights reserved.</p>
        <p>Professional Pest Control Services</p>
      </div>
    </div>
  `;
};

// 2. Template Reset Password
export const resetPasswordTemplate = (url) => {
  const content = `
    <h2>Permintaan Reset Password</h2>
    <p>Halo,</p>
    <p>Kami menerima permintaan untuk mereset password akun dashboard Insekta Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
    
    <div style="text-align: center;">
      <a href="${url}" style="${styles.button}">Reset Password Sekarang</a>
    </div>

    <p style="margin-top: 20px;">Link ini hanya berlaku selama 10 menit.</p>
    <p>Jika Anda tidak merasa meminta reset password, mohon abaikan email ini. Akun Anda tetap aman.</p>
  `;
  return wrapEmail(content);
};

// 3. Template Welcome User (Untuk User Baru yang dibuat Admin)
export const welcomeUserTemplate = (name, email, password, loginUrl) => {
  const content = `
    <h2>Selamat Datang di Insekta Dashboard!</h2>
    <p>Halo <strong>${name}</strong>,</p>
    <p>Akun Anda telah berhasil dibuat oleh Administrator. Berikut adalah kredensial login Anda:</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Password Sementara:</strong> <span style="font-family: monospace; font-size: 16px; background: #eee; padding: 2px 5px;">${password}</span></p>
    </div>

    <div style="${styles.warning}">
      <strong>Penting:</strong> Demi keamanan, Anda diwajibkan untuk mengganti password ini saat pertama kali login.
    </div>

    <div style="text-align: center;">
      <a href="${loginUrl}" style="${styles.button}">Login ke Dashboard</a>
    </div>
  `;
  return wrapEmail(content);
};
