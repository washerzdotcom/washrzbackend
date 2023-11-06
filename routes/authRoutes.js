import express from 'express';
import { login, protect, refreshToken, signup } from '../controller/authController.js';
import { getProfile } from '../controller/userController.js';
const router = express.Router();

router.post('/login', login)
router.post('/register', signup)
router.get('/refresh', refreshToken)
router.get('/profile', protect, getProfile)

export { router as default };