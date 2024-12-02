const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Handle GET request for profile page
router.get('/', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login page if not logged in
    }

    const db = getDb();
    const { email, username, _id } = req.session.user;

    // Get shared articles for the user
    const user = await db.collection('users').findOne({ _id });
    const sharedArticles = user ? user.sharedArticles || [] : [];

    const sharedArticlesHtml = sharedArticles.map(articleId => {
        const article = db.collection('articles').findOne({ _id: articleId });
        return `
            <div>
                <h3>${article.title}</h3>
                <p>${article.content}</p>
            </div>
        `;
    }).join('');

    // Render the profile page
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Profile - My Node.js App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #fce4ec;
                color: #7b3f7f;
                margin: 0;
                padding: 0;
            }
            header {
                background-color: #e91e63;
                padding: 15px;
                text-align: center;
                color: white;
            }
            header h1 {
                margin: 0;
            }
            main {
                display: flex;
                justify-content: center;
                padding: 50px;
            }
            .profile-container {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                padding: 30px;
                width: 300px;
            }
            .profile-card h2 {
                text-align: center;
                color: #e91e63;
                margin-bottom: 20px;
            }
            .profile-details {
                font-size: 1.1em;
                margin-bottom: 15px;
            }
            .profile-details label {
                font-weight: bold;
            }
            footer {
                background-color: #e91e63;
                padding: 10px;
                text-align: center;
                color: white;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>My Profile</h1>
            <a href="/logout" style="color: #f8bbd0; margin: 0 15px;">Logout</a>
        </header>
        <main>
            <section class="profile-container">
                <div class="profile-card">
                    <h2>Welcome, ${username}!</h2>
                    <div class="profile-details">
                        <label>Email:</label>
                        <p>${email}</p>
                    </div>
                    <div class="profile-details">
                        <label>Username:</label>
                        <p>${username}</p>
                    </div>
                    <h3>Shared Articles:</h3>
                    <div>${sharedArticlesHtml || '<p>No articles shared yet.</p>'}</div>
                    <p><a href="/update-profile">Update Profile</a></p>
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

module.exports = router;
