const Question = require('../model/question');

module.exports = {
  create: async (req, res) => {
    try {
      // Automatically assign the logged-in user as the author (from JWT token payload)
      const questionData = {
        ...req.body,
        author: req.user.id
      };
      const newQuestion = new Question(questionData);
      const savedQuestion = await newQuestion.save();
      res.status(201).json(savedQuestion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const questions = await Question.find();
      res.status(200).json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) return res.status(404).json({ msg: 'Question not found' });
      res.status(200).json(question);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const updatedQuestion = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(updatedQuestion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await Question.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: 'Question deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //create question through :id/question(s) 
  createQuestion: async (questionData) => {
    const newQuestion = new Question(questionData);
    const savedQuestion = await newQuestion.save();
    return savedQuestion;
  },

  deleteQuestion: async (questionId) => {
    try {
      await Question.findByIdAndDelete(questionId);
      return 1;
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};