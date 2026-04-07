const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    content: { type: String, required: [true, 'Content is required'], trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
