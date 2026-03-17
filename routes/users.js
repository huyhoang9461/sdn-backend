var express = require('express');
var router = express.Router();
var authenticateController = require('../controller/authenticateController');

/* GET users listing. Task 3 - Only accessible by Admin */
router.get('/', authenticateController.verifyAdmin, authenticateController.getAllUsers);

module.exports = router;
