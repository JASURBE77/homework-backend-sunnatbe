const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  HwLink: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'CHECKED', 'AGAIN CHECKED'], default: 'PENDING' },
  score: { type: Number, default: 0 },
  teacherDescription: { type: String, default: "" }
});
  
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  avatar: { type: String },
  age: { type: Number, required: true },
  group: { type: String, required: true },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
  pendingLessons: { type: Number, default: 0 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  streak: { type: Number, default: 0 },
  wpm: { type: Number, default: 0 },
  level: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  recentSubmissions: { type: [submissionSchema], default: [] }
});

userSchema.index({
  name: "text",
  surname: "text",
  login: "text",
  group: "text",
});

module.exports = mongoose.model('HwUsers', userSchema);
