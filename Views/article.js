const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Route to display all articles
router.get('/', async (req, res) => {
    const db = getDb();

    try {
        const articles = await db.collection('articles').find().sort({ date: -1 }).toArray();

        const articlesHtml = articles.map(article => `
            <article>
                <h2>${article.title}</h2>
                <p>${article.content}</p>
                <small>Published on: ${new Date(article.date).toLocaleString()}</small>
                <div>
                    <!-- Heart Button for Liking -->
                    <button class="like-btn" data-article-id="${article._id}">
                        <span class="heart-icon" style="color: black;">&#9825;</span> Like
                    </button>
                    <button class="share-btn" data-article-id="${article._id}">📤 Share to My Profile</button>
                </div>
                <hr>
            </article>
        `).join('');

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Panda Articles</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #E0BFB8; /* Light Beige */
                    padding: 20px;
                    margin: 0;
                }
                h1 {
                    text-align: center;
                    color: #A95C68; /* Dusty Rose */
                }
                article {
                    background-color: #fff;
                    margin-bottom: 20px;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    margin: 0 0 10px;
                    color: #333;
                }
                small {
                    display: block;
                    margin-top: 10px;
                    color: #555;
                }
                hr {
                    margin-top: 20px;
                    border: none;
                    border-top: 1px solid #ddd;
                }
                .like-btn, .share-btn {
                    background-color: #A95C68; /* Dusty Rose */
                    color: white;
                    border: none;
                    padding: 10px;
                    margin-right: 10px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                .like-btn:hover, .share-btn:hover {
                    background-color: #8A4857; /* Darker Dusty Rose */
                }
                .heart-icon {
                    font-size: 20px;
                    transition: color 0.3s ease;
                }
            </style>
        </head>
        <body>
            <h1>Panda Articles</h1>
            ${articlesHtml || '<p>No articles available.</p>'}

            <script>
                document.querySelectorAll('.like-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const articleId = e.target.getAttribute('data-article-id');
                        const heartIcon = e.target.querySelector('.heart-icon');

                        // Toggle heart color on like
                        if (heartIcon.style.color === 'red') {
                            heartIcon.style.color = 'black'; // Reset to black if already liked
                        } else {
                            heartIcon.style.color = 'red'; // Set to red when liked
                        }

                        // Send like action to backend
                        await fetch('/like', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ articleId })
                        });
                        alert('You liked this article!');
                    });
                });

                document.querySelectorAll('.share-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const articleId = e.target.getAttribute('data-article-id');
                        await fetch('/share', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ articleId })
                        });
                        alert('Article shared to your profile!');
                    });
                });
            </script>
        </body>
        </html>
        `);

    } catch (error) {
        console.error('Error retrieving articles:', error);
        res.status(500).send('Error retrieving articles. Please try again later.');
    }
});

module.exports = router;
