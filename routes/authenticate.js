const express = require('express');
const router = express.Router();
const authenticateController = require('../controller/authenticateController');

// POST /authenticate/register
router.post('/register', authenticateController.register);

// POST /authenticate/login
router.post('/login', authenticateController.login);

// POST /authenticate/logout
router.post('/logout', authenticateController.logout);

module.exports = router;
