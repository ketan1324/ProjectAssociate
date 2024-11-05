// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, verify, login, getUsers, forgotPassword, resetPassword , deleteUser} = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../utils/validation');
const { authenticateMiddleware } = require('../middleware/auth');

// User signup
router.post('/signup', signupValidation, signup);

// Email verification
router.post('/verify', verify);

// User login
router.post('/login', loginValidation, login);

// Get all users (authenticated)
router.get('/users', authenticateMiddleware, getUsers); 
//delete useer
router.delete('/users/:id', authenticateMiddleware, deleteUser);

// Request password reset
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

router.delete('/users/:id',authenticateMiddleware,deleteUser);

module.exports = router;
