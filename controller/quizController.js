const Quiz = require('../model/quiz');
const questionController = require('./questionController');

module.exports = {
  create: async (req, res) => {
    try {
      const newQuiz = new Quiz(req.body);
      const savedQuiz = await newQuiz.save();
      res.status(201).json(savedQuiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 2. Get All Quizzes (With full Question details)
  getAll: async (req, res) => {
    try {
      // .populate('questions') swaps the IDs for the actual Question data
      const quizzes = await Quiz.find().populate('questions');
      res.status(200).json(quizzes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
      res.status(200).json(quiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('questions');
      res.status(200).json(updatedQuiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
      for (const questionId of quiz.questions) {
        await questionController.deleteQuestion(questionId);
      }
      await Quiz.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: 'Quiz deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getOnePopulate: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id).populate('questions');
      if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
      res.status(200).json(quiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createQuestion: async (req, res) => {
    try {
      // Add author from JWT token payload to question data
      const questionData = {
        ...req.body,
        author: req.user.id
      };
      const newQuestion = await questionController.createQuestion(questionData);
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        { $push: { questions: newQuestion._id } },
        { new: true }
      ).populate('questions');
      res.status(200).json(updatedQuiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  createQuestions: async (req, res) => {
    try {
      // Expecting req.body to be an array of question objects
      const questionIds = [];
      for (const questionData of req.body) {
        // Add author from JWT token payload to each question
        const questionWithAuthor = {
          ...questionData,
          author: req.user.id
        };
        const newQuestion = await questionController.createQuestion(questionWithAuthor);
        questionIds.push(newQuestion._id);
      }

      const updatedQuiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        { $push: { questions: { $each: questionIds } } },
        { new: true }
      ).populate('questions');
      res.status(200).json(updatedQuiz);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};