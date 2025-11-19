<p align="center">
  <img src="https://raw.githubusercontent.com/ateeq-mughal/junoon/main/junoon-banner.png" alt="Junoon LMS Banner" width="100%">
</p>

# 🌟 [Junoon](https://www.junoon.com.pk/)  – A Modern Learning Management System

**[Junoon](https://www.junoon.com.pk/)** is a scalable **Learning Management System (LMS)** that I engineered from the ground up.  
It powers **Flutter-based Android & iOS apps** and a **Next.js admin dashboard**, providing a seamless experience for students, instructors, and admins.  

Designed with a **cloud-native architecture** and built for **real-world usage**, Junoon combines content delivery, assessments, real-time communication, and scalable infrastructure.  

---

## ✨ What Junoon Offers

📚 **Digital Learning Hub**  
- Structured into **Tracks → Subjects → Chapters → Topics**  
- Students access **notes** and **recorded lecture videos** (stored securely on AWS S3, streamed via CloudFront)  

📝 **Smart Assessments**  
- **Track Exams** (per course track) & **University Exams** (with section-wise questions)  
- Automatic grading with **detailed result summaries** (per-section breakdowns, selected & correct answers)  

📊 **Student Dashboard**  
- View exam history, scores, and available content  
- Clear insights into progress  

🔔 **Personalized Notifications**  
- Admins send announcements to:  
  - All students  
  - By grade or track  
  - Or directly to a single student  
- Students can mark notifications as read  

💬 **Real-Time Chat**  
- Powered by **Django Channels + WebSockets**  
- Chats visible to all admins until the **first reply assigns ownership**  
- Keeps students engaged and supported  

🌐 **Admin Dashboard**  
- Built in **Next.js**, connected to the same backend APIs  
- Manage **tracks, subjects, notes, videos, exams, and notifications**  
- Intuitive interface for instructors and admins  

---

## 🏗️ Architecture Overview

📱 Flutter Apps (Android/iOS)

└──> [Junoon](https://www.junoon.com.pk/) REST API (Django DRF)

├── Contents (Notes, Videos)

├── Exams (Track & University)

├── Tracks (Enrollment, Progress)

├── Notifications

└── Chat (Django Channels)

└──> AWS S3 + CloudFront (Media delivery)

└──> PostgreSQL (RDS) + PgBouncer (Connection pooling)


🌐 Next.js Admin Dashboard

└──> Consumes the same REST APIs


---

## 🛠️ Tech Highlights

- **Backend**: Django REST Framework
- **Mobile**: Flutter (Android & iOS)  
- **Admin Dashboard**: Next.js  
- **Database**: PostgreSQL (Amazon RDS)  
- **Deployment**: Docker + AWS ECS (Fargate)  
- **Storage & Delivery**: AWS S3 + CloudFront  
- **Secrets Management**: AWS Secrets Manager  
- **Scalability**: AWS Proxy for DB connection pooling  
- **Real-time**: Django Channels + Redis
- **Background Tasks**: Celery

---

## 🚀 What [Junoon](https://www.junoon.com.pk/) Showcases?

[Junoon](https://www.junoon.com.pk/) represents my passion for **scalable backend engineering** and **cloud-native systems**.  
The project challenged me to combine:  
- 🎯 **Backend APIs** for mobile and web clients  
- 📡 **Real-time chat and notifications**  
- 🗄️ **Cloud-native deployment pipelines**  
- 🔒 **Secure media storage and delivery**  

It’s more than just an LMS—it’s a platform built with **students’ experience and system scalability in mind**.  

---

## 📌 Roadmap

- [ ] Live video classes with WebRTC  
- [ ] AI-driven learning exam preparations  
- [ ] Advanced analytics for instructors  

---

## 👨‍💻 About Me

Hi, I’m **Ateeq Ur Rehman** 👋
- 🤖 AI Engineer (LLMs, MCP, Agentic AI, GDPR)
- 🖥️ Software Engineer (Python, Django, FastAPI, Cloud-native systems)  
- 🎓 MS in AI from Milano-Bicocca, passionate about building impactful products.  
- 🌍 Currently based in Milan, Italy.  
- 🚀 Interested in **Backend/AI engineering roles**  

🔗 [LinkedIn](https://www.linkedin.com/in/ateeq-ur-rehman-nedian/) | [GitHub](https://github.com/ateeq-mughal)  

---

⚡ **[Junoon](https://www.junoon.com.pk/) is not just a project, it’s a demonstration of how I design and build real-world, production-ready systems.**  
