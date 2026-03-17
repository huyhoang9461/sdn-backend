const express = require('express');
const router = express.Router();
const quizController = require('../controller/quizController');
const authenticateController = require('../controller/authenticateController');

// Task 2: Allow anyone to perform GET operations
router.get('/', quizController.getAll);
router.get('/:id', quizController.getOne);
router.get('/:id/populate', quizController.getOnePopulate);

// Task 2: Allow only Admin to perform POST, PUT and DELETE operations
router.post('/', authenticateController.verifyAdmin, quizController.create);
router.put('/:id', authenticateController.verifyAdmin, quizController.update);
router.delete('/:id', authenticateController.verifyAdmin, quizController.delete);

// Additional admin operations for questions within a quiz
router.post('/:id/question', authenticateController.verifyAdmin, quizController.createQuestion);
router.post('/:id/questions', authenticateController.verifyAdmin, quizController.createQuestions);

module.exports = router;
