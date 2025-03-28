const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

// Set up email transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.APPLICATION_GMAIL,
        pass: process.env.MY_APP_PASSWORD,  // Use App Password (not regular Gmail password)
    },
});

// Enable CORS
const corsHandler = cors({
    origin: "*", // Allow all origins or specify your frontend URL like "http://localhost:3000"
});

// Cloud Function to send test email
exports.sendTestEmail = functions.https.onRequest((req, res) => {
    // Handle preflight (OPTIONS) requests explicitly
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*"); // Allow all origins or specify the front-end URL
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res.status(204).send(""); // No content for OPTIONS request
    }

    // Use CORS middleware for POST request
    corsHandler(req, res, async () => {
        const mailOptions = {
            from: process.env.APPLICATION_GMAIL,
            to: 'wesleyvane13@gmail.com', // Replace with your test email
            subject: 'Test Email',
            text: 'This is a test email from Nodemailer using Gmail!',
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            res.status(200).send({ success: true, message: 'Email sent: ' + info.response });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ success: false, message: 'Error sending email: ' + error.message });
        }
    });
});

