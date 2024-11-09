const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // MongoDB Atlas connection
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const { ObjectID } = require('mongodb');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'amithaprabathi2001@gmail.com', // your email address
        pass: 'vrfh bxni ltlb vblj', // your email password (use app-specific password if using Gmail)
    },
});

// Route for user registration form
router.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Registration - My Node.js App</title>
        <style>
            /* General reset */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            /* Body styling */
            body {
                font-family: 'Arial', sans-serif;
                background-color: #ffe6f2; /* Light pink background */
                color: #333;
                padding: 20px;
            }

            /* Header styling */
            header {
                text-align: center;
                background-color: #ff66b2; /* Bright pink header */
                padding: 15px;
                margin-bottom: 20px;
            }

            header h1 {
                color: white;
                font-size: 2.5em;
            }

            header a {
                color: white;
                font-size: 1.2em;
                text-decoration: none;
            }

            /* Registration container */
            .register-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 70vh;
            }

            .register-card {
                background-color: white;
                padding: 30px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                width: 100%;
                max-width: 400px;
                text-align: center;
            }

            .register-card h2 {
                color: #ff66b2; /* Bright pink for headings */
                font-size: 1.8em;
                margin-bottom: 20px;
            }

            .form-group {
                margin-bottom: 15px;
                text-align: left;
            }

            label {
                font-size: 1em;
                color: #555;
            }

            input[type="text"],
            input[type="email"],
            input[type="password"] {
                width: 100%;
                padding: 10px;
                margin-top: 5px;
                border-radius: 5px;
                border: 1px solid #ff66b2; /* Light pink border */
                font-size: 1em;
                background-color: #ffe6f2; /* Light pink background */
            }

            button {
                width: 100%;
                padding: 12px;
                background-color: #ff66b2; /* Bright pink button */
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 1.2em;
                cursor: pointer;
                margin-top: 15px;
            }

            button:hover {
                background-color: #ff3385; /* Darker pink on hover */
            }

            p {
                margin-top: 15px;
            }

            p a {
                color: #ff66b2;
                text-decoration: none;
            }

            footer {
                text-align: center;
                margin-top: 20px;
                color: #ff66b2;
            }

            footer p {
                font-size: 1em;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>User Registration</h1>
            <a href="/" style="color: #FFB6C1; margin: 0 15px; text-decoration: none; font-size: 1.1em;">Home</a>
        </header>
        <main>
            <section class="register-container">
                <div class="register-card">
                    <h2>Create Your Account</h2>
                    <form action="/register" method="POST" class="register-form">
                        <div class="form-group">
                            <label for="name">Name:</label>
                            <input type="text" id="name" name="name" placeholder="Enter your name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </div>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App</p>
        </footer>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// Handle user registration
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    const db = getDb(); // Get the MongoDB database instance

    try {
        // Check if the email already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.send('This email is already registered. Please use a different email.');
        }

        // Hash the password and generate a salt
        const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // Insert the user into MongoDB with hashed password and salt
        const result = await db.collection('users').insertOne({
            email,
            password: hashedPassword,  // Store hashed password
            salt,  // Optionally, store the salt if needed for specific use cases
            name,
            twofa_secret: speakeasy.generateSecret({ length: 20 }).base32,
            emailVerified: false, // Field to track email verification
            verificationToken: "" // Initialize it as empty
        });

        // After insertion, update with the verification token (which is the insertedId)
        const verificationToken = result.insertedId.toString();

        await db.collection('users').updateOne(
            { _id: result.insertedId },
            { $set: { verificationToken } }
        );

        // Send verification email with token
        const mailOptions = {
            from: 'amithaprabathi2001@gmail.com',
            to: email,
            subject: 'Email Verification for Your Account',
            html: `
                <h1>Verify Your Email</h1>
                <p>Thank you for registering! Please click the button below to verify your email address and complete your registration.</p>
                <a href="http://localhost:3000/verify-email?token=${verificationToken}" 
                   style="display:inline-block; padding: 10px 20px; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px;">
                   Verify Email
                </a>
                <p>If the button above doesn't work, please copy and paste this link into your browser:</p>
                <p>http://localhost:3000/verify-email?token=${verificationToken}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);

        // QR Code generation for 2FA
        const secret = speakeasy.generateSecret({ length: 20 });
        const data_url = await qrcode.toDataURL(secret.otpauth_url);

        // Respond with SweetAlert2 for success message
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Registration Successful</title>
                <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            </head>
            <body>
                <script>
                    Swal.fire({
                        title: 'Registration Successful!',
                        text: 'A verification email has been sent to ${email}.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(function() {
                        window.location.href = '/';
                    });
                </script>
            </body>
            </html>
        `;
        res.send(htmlContent);

    } catch (err) {
        console.error('Error saving the user:', err);
        res.send('An error occurred while registering. Please try again later.');
    }
});

module.exports = router;
