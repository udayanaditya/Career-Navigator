const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    type: {
      type: String,
      enum: ['interests', 'subjects', 'comprehensive'],
      required: [true, 'Please specify quiz type'],
    },
    questions: [
      {
        text: {
          type: String,
          required: [true, 'Please add question text'],
        },
        category: {
          type: String,
          required: [true, 'Please add question category'],
        },
        options: [
          {
            text: {
              type: String,
              required: [true, 'Please add option text'],
            },
            value: {
              type: Number,
              required: [true, 'Please add option value'],
            },
            interests: [
              {
                name: String,
                weight: {
                  type: Number,
                  min: 1,
                  max: 10,
                },
              },
            ],
            subjects: [
              {
                name: String,
                weight: {
                  type: Number,
                  min: 1,
                  max: 10,
                },
              },
            ],
          },
        ],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', QuizSchema);