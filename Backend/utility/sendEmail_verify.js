import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from "dotenv";
import { verificationEmailHTML, changePasswordEmail } from "./emailHTML.js";
dotenv.config({ path: ".env" });

const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL;
const API_KEY = process.env.BREVO_API_KEY;

// Configure the Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = API_KEY;

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// send email
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
        return code;
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        return null;
    }
};

// email for pass
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

// verify email
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
