import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";

dotenv.config({ path: ".env" });

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendEmail = async (email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
            pool: true,
        });

        const code = generateCode();
        console.log("email code", code);

        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Verify your email",
            html: verificationEmailHTML(code),
        });

        // Close the connection pool after sending
        transporter.close();

        return code;
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        return null;
    }
};

const pas_Email = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
            pool: true,
        });

        const link = `https://qazi-law.vercel.app/change-password/${token}`;

        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Reset your password",
            html: changePasswordEmail(link),
        });

        transporter.close();

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
