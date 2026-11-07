const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for report is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    details: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for query efficiency
reportSchema.index({ product: 1, reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);

