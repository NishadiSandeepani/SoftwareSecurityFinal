const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // Adjust as per your database setup
const nodemailer = require('nodemailer'); // For sending email

// Resend verification email route
router.get('/', async (req, res) => {
    const { email } = req.query; // You may need to pass the email in the query parameter or session

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    const db = getDb();

    try {
        // Normalize email for case insensitivity (optional, but recommended)
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).send('User not found.');
        }

        // Assuming you have a verification link logic
        const verificationLink = `http://example.com/verifyemail?token=${user.verificationToken}`;

        // Send email (Using nodemailer or your preferred service)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'amithaprabathi2001@gmail.com',
                pass: 'vrfh bxni ltlb vblj',
            }
        });

        const mailOptions = {
            from: 'amithaprabathi2001@gmail.com',
            to: user.email,
            subject: 'Email Verification',
            text: `Click on the following link to verify your email: ${verificationLink}`,
        };

        await transporter.sendMail(mailOptions);
        res.send('Verification email sent.');

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error sending email or finding user.');
    }
});

module.exports = router;
