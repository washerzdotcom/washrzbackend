import express from 'express';
import { login, refreshToken, signup } from '../controller/authController.js';
const router = express.Router();

router.post('/login', login)
router.post('/register', signup)
router.get('/refresh', refreshToken)

export { router as default };