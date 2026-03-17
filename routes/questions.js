const express = require('express');
const router = express.Router();
const questionController = require('../controller/questionController');
const authenticateController = require('../controller/authenticateController');

// Allow anyone to perform GET operations
router.get('/', questionController.getAll);
router.get('/:id', questionController.getOne);

// Requir login to create a new question (which establishes the author)
router.post('/', authenticateController.requireLogin, questionController.create);

// Task 4: Only author can update and delete their submitted questions
router.put('/:id',
    authenticateController.loadQuestion,
    authenticateController.verifyAuthor,
    questionController.update
);

router.delete('/:id',
    authenticateController.loadQuestion,
    authenticateController.verifyAuthor,
    questionController.delete
);

module.exports = router;
