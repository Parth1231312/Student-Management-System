# 🎓 EduTrack v2.0 — Student Management System

A full-stack Student Management System with role-based access for **Admin** and **Students**.

---

## 📁 Project Structure

```
student-management-system/
├── backend/
│   ├── controllers/
│   │   ├── studentController.js    # Student CRUD, auth, attendance, marks
│   │   └── announcementController.js
│   ├── models/
│   │   ├── Student.js              # Extended schema with attendance/marks records
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── studentRoutes.js
│   │   └── announcementRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── css/
    │   └── style.css               # Shared dark theme
    ├── js/
    │   └── shared.js               # Auth, API helpers, sidebar, toasts
    ├── pages/
    │   ├── dashboard.html          # Admin: overview stats
    │   ├── students.html           # Admin: CRUD student management
    │   ├── attendance.html         # Admin: mark attendance for all students
    │   ├── marks.html              # Admin: add/update exam marks
    │   ├── announcements.html      # Admin: post/delete announcements
    │   ├── student-portal.html     # Student: profile + overview
    │   ├── my-attendance.html      # Student: attendance calendar + log
    │   ├── my-marks.html           # Student: subject-wise marks + charts
    │   └── my-announcements.html   # Student: view notices
    └── index.html                  # Login (admin & student)
```

---

## 🚀 Setup

### Prerequisites
- Node.js v16+
- MongoDB (local on port 27017)

### Install & Run

```bash
cd backend
npm install
npm run dev        # development with auto-reload
# or
npm start          # production
```

Open: **http://localhost:5000**

---

## 🔑 Login Credentials

| Role    | Username      | Password   |
|---------|---------------|------------|
| Admin   | `admin`       | `admin123` |
| Student | Roll Number   | Set by admin when creating student |

---

## ✨ Features

### 👨‍💼 Admin
| Feature | Description |
|---------|-------------|
| Dashboard | Stats: total students, avg marks, avg attendance, grade distribution |
| Add Student | Register student with name, roll, email, password, course, phone, address |
| Student List | View, search, filter, edit, delete students |
| Manage Attendance | Mark present/absent per student per date+subject, bulk mark all |
| Manage Marks | Add subject-wise marks per student per exam type |
| Announcements | Post, view, delete notices with priority (High/Medium/Low) |

### 👨‍🎓 Student
| Feature | Description |
|---------|-------------|
| Login | Roll number + password |
| My Profile | View personal info, marks, grade, attendance summary |
| My Attendance | Calendar view, subject filter, attendance log, overall % |
| My Marks | Subject-wise breakdown, performance ring chart, grade per subject |
| Notices | View announcements with priority filter |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students/auth/login` | Login (admin or student) |
| GET | `/api/students` | All students |
| POST | `/api/students` | Create student |
| GET | `/api/students/:id` | Get student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/search?q=` | Search by name |
| GET | `/api/students/filter?type=` | Filter high_marks / low_attendance |
| GET | `/api/students/stats` | Dashboard stats |
| POST | `/api/students/:id/attendance` | Add single attendance record |
| POST | `/api/students/:id/marks` | Add/update marks record |
| POST | `/api/students/bulk-attendance` | Mark attendance for all students |
| GET | `/api/announcements` | All announcements |
| POST | `/api/announcements` | Create announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Frontend | HTML5, CSS3, Vanilla JS |
| Fonts | Outfit, JetBrains Mono |
