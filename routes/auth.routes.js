import express from 'express';
import { loginValidation, signUpValidation, resetPasswordValidation } from '../middleware/auth.validator.js';
import { register, login, resetPassword, logout, getAllUsers } from '../controllers/auth.controller.js';
import isLoggedIn from '../middleware/auth.js';

const authRouter = express.Router();

// --- Reusable Component Schemas (defined once) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user.
 *           example: "60d0fe4f5311236168a109ca"
 *         username:
 *           type: string
 *           description: The user's username.
 *           example: "johndoe"
 *         email:
 *           type: string
 *           description: The user's email address.
 *           example: "johndoe@example.com"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A message describing the error.
 *           example: "Invalid credentials"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// --- API Endpoints ---

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Authentication]
 *     description: Creates a new user account. The `signUpValidation` middleware validates the input.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "janesmith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "janesmith@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "strongpassword123"
 *     responses:
 *       "201":
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad request (e.g., validation error, user already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/register', signUpValidation, register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [User Authentication]
 *     description: Authenticates a user with email and password, returning a JWT token upon success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "janesmith@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "strongpassword123"
 *     responses:
 *       "200":
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       "401":
 *         description: Unauthorized (invalid credentials).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/login', loginValidation, login);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [User Authentication]
 *     description: Initiates a password reset process for the user with the given email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "janesmith@example.com"
 *     responses:
 *       "200":
 *         description: If a user with that email exists, a password reset link will be sent.
 *       "400":
 *         description: Bad request (e.g., validation error).
 */
authRouter.post('/reset-password', resetPasswordValidation, resetPassword);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [User Authentication]
 *     description: Clears the user's session (e.g., by clearing the JWT cookie).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully logged out.
 */
authRouter.get('/logout', logout);

/**
 * @swagger
 * /allUsers:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [User Management]
 *     description: Retrieves a complete list of all users. Requires the user to be authenticated and is a protected route.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       "401":
 *         description: Unauthorized.
 */
authRouter.get('/allUsers', isLoggedIn, getAllUsers);

export default authRouter;
