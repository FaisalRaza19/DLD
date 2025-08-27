import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";
dotenv.config({ path: ".env" });

const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL;

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendEmail = async (email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.BREVO_SMTP_LOGIN,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });

        const code = generateCode();
        console.log("email code", code);

        const mailOptions = {
            to: email,
            from: FROM_EMAIL,
            subject: "Verify your email",
            html: verificationEmailHTML(code),
        };

        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully!");

        return code;
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        return null;
    }
};

const pas_Email = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.BREVO_SMTP_LOGIN,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });

        const link = `https://qazi-law.vercel.app/change-password/${token}`;

        const mailOptions = {
            to: email,
            from: FROM_EMAIL,
            subject: "Reset your password",
            html: changePasswordEmail(link),
        };

        await transporter.sendMail(mailOptions);

        return true;
    } catch (error) {
        console.error("Failed to send password reset email:", error.message);
        return null;
    }
};

const verifyEmail = (userCode, emailCode) => {
    if (!userCode || !emailCode) {
        throw new Error("Verification code is required.");
    }
    if (parseInt(userCode) !== parseInt(emailCode)) {
        throw new Error("Invalid verification code.");
    }
    return true;
};

export { sendEmail, pas_Email, verifyEmail };
