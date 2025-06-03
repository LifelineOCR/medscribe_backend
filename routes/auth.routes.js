import express from 'express';
import { loginValidation, signUpValidation, resetPasswordValidation } from '../middleware/auth.validator.js';

import { register, login, resetPassword, logout, getAllUsers } from '../controllers/auth.controller.js';
import isLoggedIn from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/register', signUpValidation, register);
authRouter.post('/login', loginValidation, login);
authRouter.post('/reset-password', resetPasswordValidation, resetPassword);
authRouter.get('/logout', logout);
authRouter.get('/allUsers', isLoggedIn, getAllUsers); 

export default authRouter;