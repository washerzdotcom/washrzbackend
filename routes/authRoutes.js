import express from 'express';
import { login, refreshToken } from '../controller/authController.js';
const router = express.Router();

router.post('/login', login)
router.get('/refresh', refreshToken)

export { router as default };