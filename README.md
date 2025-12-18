MERN Event Platform

A full-stack event management web app built using MongoDB, Express.js, React.js, Node.js. 
Users can create, view, edit, delete, and RSVP to events—securely and in real time.

---

Live Demo Links

Frontend
https://mern-event-platform-react.onrender.com

Backend
https://mern-event-platform-qgpq.onrender.com

---

GitHub Repository
(https://github.com/mhsanjunaid-dot/mern-event-platform)

---
📸 Screenshots

Below are quick visuals from the platform showing user flow and responsive design.

🟣 Sign Up Page

🟣 Login Page

🟣 Dashboard

🟣 Events List

🟣 Create Event Page

🟣 Responsive UI

---

---
Login Credentials 
You may create your own account — signup is live and secure.

---

Features Overview

User Authentication
- Secure Signup & Login
- Password hashing with bcrypt
- Fully JWT-protected routes

Event Management
- Create events
- Upload event images
- Edit events
- Delete events
- View all events
- Automatic attendee tracking

RSVP System
- Join or Leave events
- Capacity strictly enforced
- Creator auto-added as attendee
- Attendee count always accurate

Image Handling
- Cloudinary image upload
- Image stored per event
- Auto-displayed on frontend

Responsive UI
- Fully mobile adaptive
- Fast, clean React layout

---

Bonus Enhancements Implemented
✔ Search events
✔ Filter dashboard
✔ Sort by date or title
✔ User event tagging (created vs attending)
✔ Real-time update on RSVP changes

---

Concurrency + Capacity Logic (Explanation)
This app prevents over-booking using atomic MongoDB updates inside RSVP routes.

Example logic:
await Event.findOneAndUpdate(
  { _id: eventId, attendees: { $ne: userId }, $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }},
  { $addToSet: { attendees: userId }},
  { new: true }
);

What this solves:
- User cannot RSVP twice
- User cannot exceed event capacity
- Two people cannot take the last spot at the same time

This ensures:
✔ data integrity
✔ zero race conditions
✔ accurate participant count

---

Tech Stack

Frontend
- React
- Axios
- React Router
- Vite

Backend
- Node.js
- Express.js
- Mongoose
- Multer
- Cloudinary
- JWT

Database
- MongoDB Atlas

Deployment
- Frontend → Render
- Backend → Render
- DB → MongoDB Atlas

---

Installation — Run Locally

1. Clone repo:
git clone <repo-link>

2. Install backend deps:
cd server
npm install

3. Create backend .env file:
PORT=5000
MONGO_URI=your_atlas_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
FRONTEND_URL=http://localhost:5173

4. Start backend:
npm start

5. Install frontend deps:
cd client
npm install

6. Create frontend .env
VITE_API_URL=http://localhost:5001/api

7. Start frontend
npm run dev

---



Folder Structure
root
 ├── client (React)
 └── server (Express)

---

API Endpoints

AUTH
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me

EVENTS
GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

RSVP
POST /api/rsvp/join/:id
DELETE /api/rsvp/leave/:id

---

Security Notes
- JWT stored client-side
- Protected backend routes
- CORS locked to deployment domains
- Input validation
- Passwords hashed

---

Credits
Developed by maimoona (MERN Full-Stack Developer)
