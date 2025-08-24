import nodemailer from "nodemailer";
import { verificationEmailHTML, changePasswordEmail, } from "./emailHTML.js";

// generate verification code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

// email for varification
const sendEmail = async (email) => {
    try {
        // create transpoter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // create verification code 
        const code = generateCode();
        console.log("email code", code)

        // send email 
        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Verify your email",
            html: verificationEmailHTML(code),
        })

        return code;
    } catch (error) {
        return new Error("Failed to send verification code");
    }
}

// email for change password
const pas_Email = async (email, token) => {
    try {
        // create transpoter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        const link = `http://localhost:3000/change-password/${token}`
        // send email 
        await transporter.sendMail({
            from: `"DLD (Digital Lawyer Diary)" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Verify your email for reset password",
            html: changePasswordEmail(link),
        })

        return code;
    } catch (error) {
        return new Error("Failed to send verification code");
    }
}

const verifyEmail = (userCode, emailCode) => {
    if (!userCode || !emailCode) {
        throw new Error("Verification code is required.");
    }
    if (parseInt(userCode) !== parseInt(emailCode)) {
        throw new Error("Invalid verification code.");
    }
    return true;
}

export { sendEmail, pas_Email, verifyEmail }