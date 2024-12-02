// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB
require('dotenv').config(); // Load environment variables from .env

// Import route files
const homeRoute = require('./Views/home');
const registerRoute = require('./Views/register');
const loginRoute = require('./Views/login');
const forgotpasswordRoute = require('./Views/forgotpassword');
const verifyRouter = require('./Views/verify');
const dashboardRouter = require('./Views/dashboard');
const logoutRouter = require('./Views/logout');
const verifyemailRouter = require('./Views/verifyemail');

const myprofileRouter = require('./Views/myprofile');
const logsRouter = require('./Views/logs');//confirm
const confirmRouter = require('./Views/confirm');
const adminDashboardRouter = require('./Views/adminDashboard');//adminDashboard addArticle
const addArticleRouter = require('./Views/addArticle');//article
const articleRouter = require('./Views/article');

const myprofileRouter = require('./Views/myprofile');//logs
const logsRouter = require('./Views/logs');//logs



// Create the express app
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware with session secret from .env
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority`
    }),
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true, // Helps prevent XSS attacks
        maxAge: 1000 * 60 * 60 * 24 // 1-day session expiration
    }
}));

// Set up routes
app.use('/', homeRoute);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/forgotpassword', forgotpasswordRoute);
app.use('/verify-email', verifyRouter);
app.use('/dashboard', dashboardRouter);
app.use('/logout', logoutRouter);
app.use('/verifyemail', verifyemailRouter);
app.use('/myprofile', myprofileRouter);
app.use('/logs', logsRouter);

app.use('/confirm', confirmRouter);
app.use('/adminDashboard', adminDashboardRouter);//addArticle
app.use('/addArticle', addArticleRouter);//article
app.use('/article', articleRouter);




// Simple homepage route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Personal Growth Journal</h1>');
});

// Connect to MongoDB (database connection details are in db.js)
const { connectToMongoDB } = require('./db');
connectToMongoDB();

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
