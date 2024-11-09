const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Logs route to display logs in HTML
router.get('/', async (req, res) => {
    const db = getDb();
    
    try {
        const logs = await db.collection('logs').find({}).toArray();
        let logsHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Login/Logout Logs</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    color: #8a4c57;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }
                header {
                    background-color: #8a4c57;
                    color: white;
                    padding: 20px 0;
                    text-align: center;
                }
                h1 {
                    margin: 0;
                    font-size: 2em;
                }
                a {
                    color: #ff8da1;
                    margin-top: 10px;
                    font-size: 1.1em;
                    text-decoration: none;
                    display: inline-block;
                }
                a:hover {
                    text-decoration: underline;
                }
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #d3a6b4;
                }
                th {
                    background-color: #ff8da1;
                    color: white;
                }
                td {
                    background-color: #f9f9f9;
                }
                tr:nth-child(even) td {
                    background-color: #f2d8dd;
                }
                tr:hover td {
                    background-color: #e1c3cd;
                }
                footer {
                    background-color: #8a4c57;
                    color: white;
                    text-align: center;
                    padding: 10px 0;
                    position: fixed;
                    width: 100%;
                    bottom: 0;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>User Login/Logout Logs</h1>
                <a href="/dashboard">Back</a>
            </header>
            <main>
                <table>
                    <tr>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>Device</th>
                    </tr>`;
        
        logs.forEach(log => {
            logsHtml += `<tr>
                <td>${log.loginTime}</td>
                <td>${log.logoutTime ? log.logoutTime : 'Still logged in'}</td>
                <td>${log.device}</td>
            </tr>`;
        });

        logsHtml += `</table>
            </main>
            <footer>
                <p>&copy; 2024 My Node.js App</p>
            </footer>
        </body>
        </html>`;

        res.send(logsHtml);
    } catch (err) {
        console.error('Error retrieving logs:', err);
        res.status(500).send('Error retrieving logs');
    }
});

module.exports = router;
