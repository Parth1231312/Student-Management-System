const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function calculateGrade(marks) {
  if (marks >= 80) return 'A';
  if (marks >= 60) return 'B';
  return 'C';
}

// Escape string for use in MongoDB $regex to prevent ReDoS
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/students - Create student
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, password, course, phone, address, marks, attendance } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'student123', 10);
    const student = new Student({
      name, rollNumber, email,
      password: hashedPassword,
      course, phone, address,
      marks: marks || 0,
      attendance: attendance || 0,
      grade: calculateGrade(marks || 0),
    });
    const saved = await student.save();
    const data = saved.toObject();
    delete data.password;
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, password, course, phone, address, marks, attendance } = req.body;
    const updateData = { name, rollNumber, email, course, phone, address, marks, attendance, grade: calculateGrade(marks || 0) };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { q, rollNumber } = req.query;
    let query = {};
    if (q) query.name = { $regex: escapeRegex(q), $options: 'i' };
    if (rollNumber) query.rollNumber = { $regex: escapeRegex(rollNumber), $options: 'i' };
    const students = await Student.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.filterStudents = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type === 'high_marks') query.marks = { $gt: 80 };
    else if (type === 'low_attendance') query.attendance = { $lt: 75 };
    const students = await Student.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const lowAttendance = await Student.countDocuments({ attendance: { $lt: 75 } });
    const aggResult = await Student.aggregate([
      { $group: { _id: null, avgMarks: { $avg: '$marks' }, avgAttendance: { $avg: '$attendance' } } },
    ]);
    const avgMarks = aggResult.length ? Math.round(aggResult[0].avgMarks * 10) / 10 : 0;
    const avgAttendance = aggResult.length ? Math.round(aggResult[0].avgAttendance * 10) / 10 : 0;
    const gradeA = await Student.countDocuments({ grade: 'A' });
    const gradeB = await Student.countDocuments({ grade: 'B' });
    const gradeC = await Student.countDocuments({ grade: 'C' });
    res.json({ success: true, data: { total, lowAttendance, avgMarks, avgAttendance, gradeA, gradeB, gradeC } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addAttendance = async (req, res) => {
  try {
    const { date, status, subject } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const existing = student.attendanceRecords.find(r => r.date === date && r.subject === (subject || ''));
    if (existing) { existing.status = status; }
    else { student.attendanceRecords.push({ date, status, subject: subject || '' }); }
    const total = student.attendanceRecords.length;
    const present = student.attendanceRecords.filter(r => r.status === 'present').length;
    student.attendance = total > 0 ? Math.round((present / total) * 100) : 0;
    await student.save();
    const data = student.toObject(); delete data.password;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addMarks = async (req, res) => {
  try {
    const { subject, examType, score, maxScore, date } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const existing = student.marksRecords.find(r => r.subject === subject && r.examType === examType);
    if (existing) { existing.score = score; existing.maxScore = maxScore || 100; existing.date = date || ''; }
    else { student.marksRecords.push({ subject, examType: examType || 'Mid Term', score, maxScore: maxScore || 100, date: date || '' }); }
    if (student.marksRecords.length > 0) {
      const total = student.marksRecords.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0);
      student.marks = Math.round(total / student.marksRecords.length);
      student.grade = calculateGrade(student.marks);
    }
    await student.save();
    const data = student.toObject(); delete data.password;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkAttendance = async (req, res) => {
  try {
    const { records, date, subject } = req.body;
    const updates = [];
    for (const rec of records) {
      const student = await Student.findById(rec.studentId);
      if (!student) continue;
      const existing = student.attendanceRecords.find(r => r.date === date && r.subject === (subject || ''));
      if (existing) { existing.status = rec.status; }
      else { student.attendanceRecords.push({ date, status: rec.status, subject: subject || '' }); }
      const total = student.attendanceRecords.length;
      const present = student.attendanceRecords.filter(r => r.status === 'present').length;
      student.attendance = total > 0 ? Math.round((present / total) * 100) : 0;
      await student.save();
      updates.push(student._id);
    }
    res.json({ success: true, updated: updates.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/students/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Admin login from .env — no hardcoded credentials
    if (username === process.env.ADMIN_USERNAME) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign({ role: 'admin', name: 'Administrator' }, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ success: true, token, role: 'admin', user: { name: 'Administrator', role: 'admin' } });
    }
    // Student login — bcrypt compare
    const student = await Student.findOne({ rollNumber: username });
    if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign(
      { role: 'student', id: student._id, rollNumber: student.rollNumber, name: student.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ success: true, token, role: 'student', user: { name: student.name, role: 'student', id: student._id, rollNumber: student.rollNumber } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
