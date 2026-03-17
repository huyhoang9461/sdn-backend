const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  
  description: { 
    type: String 
  },
  
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    required: false,
    ref: 'Question' 
  }]
});

module.exports = mongoose.model('Quiz', quizSchema);