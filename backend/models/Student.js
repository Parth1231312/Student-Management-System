const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    rollNumber: { type: String, required: [true, 'Roll number is required'], unique: true, trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
    password: { type: String, required: [true, 'Password is required'] },
    course: { type: String, required: [true, 'Course is required'], trim: true },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    marks: { type: Number, required: true, min: 0, max: 100, default: 0 },
    attendance: { type: Number, required: true, min: 0, max: 100, default: 0 },
    grade: { type: String, enum: ['A', 'B', 'C', 'N/A'], default: 'N/A' },
    // Detailed attendance records
    attendanceRecords: [
      {
        date: { type: String, required: true },
        status: { type: String, enum: ['present', 'absent'], required: true },
        subject: { type: String, default: '' },
      }
    ],
    // Detailed marks per subject
    marksRecords: [
      {
        subject: { type: String, required: true },
        examType: { type: String, default: 'Mid Term' },
        score: { type: Number, min: 0, max: 100, required: true },
        maxScore: { type: Number, default: 100 },
        date: { type: String, default: '' },
      }
    ],
  },
  { timestamps: true }
);

function calculateGrade(marks) {
  if (marks >= 80) return 'A';
  if (marks >= 60) return 'B';
  return 'C';
}

studentSchema.pre('save', function (next) {
  if (this.marks != null) this.grade = calculateGrade(this.marks);
  next();
});

module.exports = mongoose.model('Student', studentSchema);
