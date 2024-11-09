const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lockedOutUntil: { type: Date, default: null }, // This field controls lockout status
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the model to use in routes
module.exports = User;
