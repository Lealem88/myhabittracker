# 📅 habit-tracker

A responsive full-stack web application engineered to track personal routines, log daily consistency, and analyze long-term habit formation data. Built with a clean frontend interface and a robust relational database backend, the application serves as a structured data-logging tool optimized for tracking behavioral trends over time.

---

## 🚀 Architectural Overview

The application is built using a reliable full-stack architecture designed to handle rapid user state changes and persistent logging:
* **Frontend UI:** React and Tailwind CSS v4 delivering a clean, minimalist dashboard featuring dynamic progress tracking, active streak counters, and responsive component layouts.
* **Backend API Layer:** PHP processing server-side logic, user authentication routing, and habit completion states.
* **Database Layer:** A structured MySQL/MSSQL relational database configured to securely log time-series entry completions and maintain continuous calendar data integrity.

---

## 🛠️ Tech Stack & Tooling

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS v4, JavaScript (ES6+) |
| **Backend** | PHP, RESTful API Architecture |
| **Database** | MySQL / MSSQL, Relational Schema Design |
| **Workflow** | Git, GitHub, Version Control |

---

## ✨ Core Engineering Features

* **Dynamic State Management:** Utilizes React's native state handling to instantly update progress metrics, current streaks, and visual completion checkmarks across the user dashboard without page reloads.
* **Next-Gen Utility Styling:** Built using Tailwind CSS v4 to ensure a lightweight, ultra-responsive layout that adapts fluidly across mobile, tablet, and desktop viewports.
* **Structured Data Persistence:** Designed with a normalized database schema to prevent duplicate entry logs for a single calendar day, ensuring accurate historical tracking data.
* **Secure API Communication:** Implements asynchronous endpoints to process CRUD operations (Create, Read, Update, Delete) for custom habits seamlessly between the client interface and the database.

---

## 📁 Repository Structure

```text
habit-tracker/
├── database/
│   └── schema.sql         # Optimized database schema definition
├── backend/
│   ├── api/               # API endpoints handling log requests
│   ├── auth/              # Server-side user session management
