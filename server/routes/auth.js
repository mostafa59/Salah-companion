import express from 'express';
import { signup, login, logout } from '../controllers/authController.js';
import { validateSignup, validateLogin, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', logout);

export default router;
