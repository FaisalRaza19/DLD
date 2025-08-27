import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";

dotenv.config({ path: ".env" });

// Generate a 6-digit verification code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Send a verification email
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
        });

        // Create verification code
        const code = generateCode();
        console.log("email code", code);

        // Send email
        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Verify your email",
            html: verificationEmailHTML(code),
        });

        return code;
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        return null;
    }
};

// Send an email for a password change request
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
        });

        const link = `https://dld-ten.vercel.app/change-password/${token}`; // Use your actual production URL

        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Verify your email for reset password",
            html: changePasswordEmail(link),
        });

        return true;
    } catch (error) {
        console.error("Failed to send password reset email:", error.message);
        return null;
    }
};

// Verify the user's code against the session code
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

