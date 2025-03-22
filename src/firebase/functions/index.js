// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");

// admin.initializeApp();
// const db = admin.firestore();

// // Set up email transport
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.APPLICATION_GMAIL,
//         pass: process.env.MY_APP_PASSWORD,  // Use App Password (not regular Gmail password)
//     },
// });

// // Cloud Function to send weekly emails
// exports.sendWeeklyEmails = functions.pubsub.schedule("every monday 08:00")
//     .timeZone("America/New_York")
//     .onRun(async () => {
//         try {
//             const authUsers = await admin.auth().listUsers();
//             const verifiedUsers = authUsers.users.filter(user => user.emailVerified);

//             if (verifiedUsers.length === 0) {
//                 console.log("No verified users found.");
//                 return;
//             }

//             const emailPromises = [];

//             for (const user of verifiedUsers) {
//                 const userId = user.uid;
//                 const applicationsRef = db.collection(`userApplications/${userId}/applications`);
//                 const snapshot = await applicationsRef.get();

//                 if (snapshot.empty) continue;

//                 let emailBody = `Hello,\n\nHere is your weekly application status update:\n`;

//                 snapshot.forEach(doc => {
//                     const app = doc.data();
//                     emailBody += `- ${app.company}: ${app.status}\n`;
//                 });

//                 emailBody += `\nBest,\nApplication Tracker`;

//                 const mailOptions = {
//                     from: "your-email@gmail.com",
//                     to: user.email,
//                     subject: "Your Weekly Application Update",
//                     text: emailBody,
//                 };

//                 emailPromises.push(transporter.sendMail(mailOptions));
//             }

//             await Promise.all(emailPromises);
//             console.log("Weekly emails sent successfully.");
//         } catch (error) {
//             console.error("Error sending weekly emails:", error);
//         }
//     });

// // Cloud Function to send test email
// exports.sendTestEmail = functions.https.onCall(async (data, context) => {
//   console.log('Before mail options')
//     const mailOptions = {
//         from: process.env.APPLICATION_GMAIL,
//         to: 'wesleyvane13@gmail.com',
//         subject: 'Test Email',
//         text: 'This is a test email from Nodemailer using Gmail!',
//     };
    
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         return { success: true, message: 'Email sent: ' + info.response };
//     } catch (error) {
//         console.error('Error sending email:', error);
//         return { success: false, message: 'Error sending email: ' + error.message };
//     }
// });


// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");
// const cors = require("cors"); // Import the CORS package

// admin.initializeApp();
// const db = admin.firestore();

// // Set up email transport
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "job.application.tracker2@gmail.com",
//         pass: "orlc ktiq blvj sblj",  // Use App Password (not regular Gmail password)
//     },
// });

// // Enable CORS with options
// const corsHandler = cors({
//     origin: "*", // Allow all origins or specify your frontend URL if you want to restrict
// });

// // Cloud Function to send test email
// exports.sendTestEmail = functions.https.onRequest((req, res) => {
//     // Handle preflight (OPTIONS) request
//     if (req.method === "OPTIONS") {
//         res.set("Access-Control-Allow-Origin", "*"); // Adjust based on your security needs
//         res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//         res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//         return res.status(204).send(""); // No content for the OPTIONS request
//     }

//     // Handle the actual POST request
//     corsHandler(req, res, async () => {
//         const mailOptions = {
//             from: "job.application.tracker2@gmail.com",
//             to: 'wesleyvane13@gmail.com', // Replace with your test email
//             subject: 'Test Email',
//             text: 'This is a test email from Nodemailer using Gmail!',
//         };

//         try {
//             const info = await transporter.sendMail(mailOptions);
//             res.status(200).send({ success: true, message: 'Email sent: ' + info.response });
//         } catch (error) {
//             console.error('Error sending email:', error);
//             res.status(500).send({ success: false, message: 'Error sending email: ' + error.message });
//         }
//     });
// });

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

