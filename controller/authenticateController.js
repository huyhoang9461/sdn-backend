const User = require('../model/user');
const Question = require('../model/question');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Helper function to generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            admin: user.admin
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Middleware to verify JWT token and attach user info to request
 */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];

    if (!token) {
        const err = new Error('No token provided!');
        err.status = 401;
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded payload to req.user
        next();
    } catch (error) {
        const err = new Error('Invalid or expired token!');
        err.status = 401;
        return next(err);
    }
};

/**
 * Authentication and Authorization Controller
 * Implements user authentication and role-based access control
 */
module.exports = {
    /**
     * Middleware to verify JWT token
     * Extracts and validates token, attaches user payload to req.user
     */
    verifyToken,

    /**
     * Middleware to check if user is logged in
     * Used for operations that require authentication
     */
    requireLogin: verifyToken,

    /**
     * Task 1: Middleware to verify Admin privileges
     * Checks if the authenticated user has admin rights from JWT payload
     * Returns 403 if user is not an admin
     */
    verifyAdmin: async (req, res, next) => {
        // First verify token
        verifyToken(req, res, (err) => {
            if (err) return next(err);

            // Check if user is admin from token payload
            if (req.user && req.user.admin) {
                next();
            } else {
                const err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
        });
    },

    /**
     * Middleware to load question from database
     * Populates req.question for subsequent middleware
     */
    loadQuestion: async (req, res, next) => {
        try {
            const question = await Question.findById(req.params.id).populate('author');
            if (!question) {
                const err = new Error('Question not found!');
                err.status = 404;
                return next(err);
            }
            req.question = question;
            next();
        } catch (error) {
            next(error);
        }
    },

    /**
     * Task 1: Middleware to verify if user is the author of a question
     * Compares JWT payload.id with question author's ObjectId
     * Returns 403 if user is not the author
     */
    verifyUser: async (req, res, next) => {
        // First verify token
        verifyToken(req, res, async (err) => {
            if (err) return next(err);

            if (!req.user || !req.user.id) {
                const err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }

            try {
                if (req.user.admin || req.user.id.toString() === req.question.author._id.toString()) {
                    next();
                } else {
                    const err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
            } catch (error) {
                next(error);
            }
        });
    },

    /**
     * Task 1: Alias for verifyUser - checks if user is the author of a question
     * This function name matches the assignment requirement terminology
     */
    verifyAuthor: async (req, res, next) => {
        // First verify token
        verifyToken(req, res, async (err) => {
            if (err) return next(err);

            if (!req.user || !req.user.id) {
                const err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }

            try {
                if (req.user.admin || req.user.id.toString() === req.question.author._id.toString()) {
                    next();
                } else {
                    const err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
            } catch (error) {
                next(error);
            }
        });
    },

    /**
     * Task 3: Get all registered users (Admin only)
     * Returns list of all users from database
     */
    getAllUsers: async (req, res, next) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Register a new user
     * Hashes the password before saving to database
     */
    register: async (req, res) => {
        try {
            const { username, password, admin } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Create new user with hashed password
            const newUser = new User({
                username,
                password: hashedPassword,
                admin: admin || false
            });

            await newUser.save();

            // Generate JWT token
            const token = generateToken(newUser);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    admin: newUser.admin
                }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Find user in DB
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Verify password with bcrypt
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Generate JWT token
            const token = generateToken(user);

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    admin: user.admin
                }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    logout: async (req, res) => {
        // With JWT, logout is handled client-side by removing the token
        // Server can optionally implement token blacklisting
        res.status(200).json({
            message: 'Logout successful. Please remove the token from client.'
        });
    }
};
