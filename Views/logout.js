const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    if (req.session && req.session.userId) {
        const db = getDb();
        const userId = req.session.userId;

        console.log(`Attempting to log out user: ${userId}`);

        try {
            // Convert userId to ObjectId
            const objectIdUserId = new ObjectId(userId);

            // Record logout time
            const result = await db.collection('logs').updateOne(
                { userId: objectIdUserId, sessionCode: req.session.sessionCode }, 
                { $set: { logoutTime: new Date() } }
            );

            if (result.modifiedCount === 0) {
                console.error(`No log entry found for userId: ${userId}`);
            } else {
                console.log(`Successfully logged out user: ${userId}`);
            }

            // Destroy session and redirect to login
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Error logging out');
                }
                res.redirect('/login');
            });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).send('An error occurred while logging out.');
        }
    } else {
        console.warn('No active session found. Redirecting to login.');
        res.redirect('/login');
    }
});

module.exports = router;
