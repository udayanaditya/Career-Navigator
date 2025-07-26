const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a career title'],
      unique: true,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    requirements: {
      education: [
        {
          level: String,
          field: String,
          importance: {
            type: Number,
            min: 1,
            max: 10,
          },
        },
      ],
      skills: [
        {
          name: String,
          importance: {
            type: Number,
            min: 1,
            max: 10,
          },
        },
      ],
      subjects: [
        {
          name: String,
          importance: {
            type: Number,
            min: 1,
            max: 10,
          },
        },
      ],
    },
    salary: {
      entry: {
        type: Number,
        required: [true, 'Please add entry level salary'],
      },
      mid: {
        type: Number,
        required: [true, 'Please add mid level salary'],
      },
      senior: {
        type: Number,
        required: [true, 'Please add senior level salary'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    jobOutlook: {
      growth: {
        type: Number, // Percentage
        required: [true, 'Please add job growth outlook'],
      },
      outlook: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        required: [true, 'Please add job outlook'],
      },
    },
    workEnvironment: {
      type: [String],
      required: [true, 'Please add work environments'],
    },
    categories: {
      type: [String],
      required: [true, 'Please add at least one category'],
    },
    interests: [
      {
        name: String,
        relevance: {
          type: Number,
          min: 1,
          max: 10,
        },
      },
    ],
    roadmap: [
      {
        stage: String,
        description: String,
        duration: String,
        milestones: [String],
      },
    ],
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['Article', 'Video', 'Course', 'Book', 'Tool', 'Other'],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create index for text search
CareerSchema.index({ title: 'text', description: 'text', 'categories': 'text' });

module.exports = mongoose.model('Career', CareerSchema);