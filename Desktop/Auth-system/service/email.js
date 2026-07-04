const nodemailer = require("nodemailer");

// Create a transporter using your Gmail credentials from .env
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false   // fixes self-signed certificate error
    }
});

// Send verification email after signup
async function sendVerificationEmail(toEmail, token) {
    const verifyLink = `${process.env.BASE_URL}/api/users/verify-email/${token}`;

    await transporter.sendMail({
        from: `"Ledgerly" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Verify your Ledgerly account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #11141B;">Verify your email</h2>
                <p style="color: #74706A;">Click the button below to verify your Ledgerly account.</p>
                <a href="${verifyLink}"
                   style="display:inline-block; background:#11141B; color:#F6F3EC;
                          padding:12px 24px; text-decoration:none; font-family:monospace;
                          font-size:13px; letter-spacing:0.05em; text-transform:uppercase;
                          margin: 20px 0;">
                    Verify Email
                </a>
                <p style="color: #74706A; font-size:12px;">
                    This link expires in 24 hours. If you did not create an account, ignore this email.
                </p>
            </div>
        `
    });
}

// Send password reset email
async function sendResetEmail(toEmail, token) {
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

    await transporter.sendMail({
        from: `"Ledgerly" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Reset your Ledgerly password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #11141B;">Reset your password</h2>
                <p style="color: #74706A;">Click the button below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetLink}"
                   style="display:inline-block; background:#11141B; color:#F6F3EC;
                          padding:12px 24px; text-decoration:none; font-family:monospace;
                          font-size:13px; letter-spacing:0.05em; text-transform:uppercase;
                          margin: 20px 0;">
                    Reset Password
                </a>
                <p style="color: #74706A; font-size:12px;">
                    If you did not request a password reset, ignore this email. Your password will not change.
                </p>
            </div>
        `
    });
}

module.exports = {
    sendVerificationEmail,
    sendResetEmail
};