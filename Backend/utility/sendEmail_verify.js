// import nodemailer from 'nodemailer';
// import dotenv from "dotenv";
// import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";
// dotenv.config({ path: ".env" });

// const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL;

// const generateCode = () => {
//     return Math.floor(100000 + Math.random() * 900000);
// };

// const sendEmail = async (email) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: "smtp-relay.brevo.com",
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.BREVO_SMTP_LOGIN,
//                 pass: process.env.BREVO_SMTP_KEY,
//             },
//         });

//         const code = generateCode();
//         console.log("email code", code);

//         const mailOptions = {
//             to: email,
//             from: FROM_EMAIL,
//             subject: "Verify your email",
//             html: verificationEmailHTML(code),
//         };

//         await transporter.sendMail(mailOptions);

//         console.log("Email sent successfully!");

//         return code;
//     } catch (error) {
//         console.error("Failed to send verification email:", error.message);
//         return null;
//     }
// };

// const pas_Email = async (email, token) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: "smtp-relay.brevo.com",
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.BREVO_SMTP_LOGIN,
//                 pass: process.env.BREVO_SMTP_KEY,
//             },
//         });

//         const link = `https://qazi-law.vercel.app/change-password/${token}`;

//         const mailOptions = {
//             to: email,
//             from: FROM_EMAIL,
//             subject: "Reset your password",
//             html: changePasswordEmail(link),
//         };

//         await transporter.sendMail(mailOptions);

//         return true;
//     } catch (error) {
//         console.error("Failed to send password reset email:", error.message);
//         return null;
//     }
// };

// const verifyEmail = (userCode, emailCode) => {
//     if (!userCode || !emailCode) {
//         throw new Error("Verification code is required.");
//     }
//     if (parseInt(userCode) !== parseInt(emailCode)) {
//         throw new Error("Invalid verification code.");
//     }
//     return true;
// };

// export { sendEmail, pas_Email, verifyEmail };



// This utility file is a great approach for sending transactional emails.
// It's recommended to keep this code separate from your campaign creation code.
// This version uses the Brevo API, which is more reliable for deployment on platforms like Railway.

import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from "dotenv";
import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";

// Load environment variables from the .env file
dotenv.config({ path: ".env" });

const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL;
const API_KEY = process.env.BREVO_API_KEY;

// Configure the Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = API_KEY;

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendEmail = async (email) => {
    try {
        const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
        const code = generateCode();
        console.log("email code", code);

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.sender = { email: FROM_EMAIL };
        sendSmtpEmail.subject = "Verify your email";
        sendSmtpEmail.htmlContent = verificationEmailHTML(code);

        await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully!");
        return code;
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        return null;
    }
};

const pas_Email = async (email, token) => {
    try {
        const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();
        const link = `https://qazi-law.vercel.app/change-password/${token}`;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.sender = { email: FROM_EMAIL };
        sendSmtpEmail.subject = "Reset your password";
        sendSmtpEmail.htmlContent = changePasswordEmail(link);

        await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
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
