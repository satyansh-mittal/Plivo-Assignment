# 🚀 Status Page Application - Plivo Assignment

A comprehensive, multi-tenant status page application built with Flask (backend) and React (frontend) featuring real-time updates, incident management, and public status pages.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 **Authentication & Authorization**
- User registration and login with JWT tokens
- Role-based access control (Admin/Member)
- Secure password hashing with bcrypt

### 🏢 **Multi-tenant Architecture**
- Organization-based isolation
- Custom organization slugs for public pages
- Team management within organizations

### 🛠️ **Service Management**
- Create and manage services
- Real-time status updates (Operational, Degraded, Partial Outage, Major Outage)
- Service history tracking

### 🚨 **Incident Management**
- Create incidents with impact levels (Minor, Major, Critical)
- Real-time incident updates and status changes
- Incident timeline and resolution tracking
- Maintenance window scheduling

### 🌐 **Public Status Pages**
- Public-facing status pages for each organization
- Real-time status display without authentication
- Historical incident data
- Responsive design for all devices

### ⚡ **Real-time Updates**
- WebSocket integration for live updates
- Instant notifications for status changes
- Real-time incident updates across all connected clients

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Flask 2.3.3
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **Real-time**: WebSocket (Flask-SocketIO)
- **Password Security**: bcrypt
- **Environment**: Python 3.9+

### **Frontend**
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **UI Components**: ShadcnUI + Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React Context API

### **Database**
- **Primary**: MySQL 8.0+
- **ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Migrations**: Flask-Migrate (if implemented)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Client  │◄──►│  Flask Backend  │◄──►│  MySQL Database │
│   (Port 5174)   │    │   (Port 5000)   │    │   (Port 3306)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │
         │                        │
         └──────WebSocket──────────┘
              Real-time Updates
```

## 📋 Prerequisites

Before running this application, make sure you have:

- **Python 3.9+** installed
- **Node.js 16+** and npm installed
- **MySQL 8.0+** running locally
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/satyansh-mittal/Plivo-Assignment.git
cd Plivo-Assignment/status-app
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE status_app;
EXIT;
```

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
MYSQL_URI=mysql+pymysql://root:your_password@localhost/status_app

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### 2. Database Initialization
```bash
# From backend directory
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database tables created!')"
```

## 🏃‍♂️ Running the Application

### 1. Start the Backend Server
```bash
# From backend directory (with virtual environment activated)
python app.py
```
Backend will be available at: http://localhost:5000

### 2. Start the Frontend Server
```bash
# From frontend directory (in a new terminal)
npm run dev
```
Frontend will be available at: http://localhost:5174

### 3. Access the Application
- **Main Application**: http://localhost:5174
- **API Documentation**: http://localhost:5000/api
- **Public Status Page**: http://localhost:5174/public/{organization-slug}

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user info
```

### Service Management
```
GET    /api/services                # Get all services
POST   /api/services                # Create new service
PUT    /api/services/{id}           # Update service status
```

### Incident Management
```
GET    /api/incidents               # Get all incidents
POST   /api/incidents               # Create new incident
POST   /api/incidents/{id}/updates  # Add incident update
```

### Public API
```
GET    /api/public/{slug}/status    # Get public status page
GET    /api/public/{slug}/timeline  # Get incident timeline
```

## 🎯 Usage

### 1. First Time Setup
1. **Register** a new organization account
2. **Login** with your credentials
3. **Create services** to monitor
4. **Set up incidents** when issues occur

### 2. Managing Services
- Navigate to the Dashboard
- Click "Add Service" to create new services
- Update service status using the status dropdown
- Monitor all services from the main dashboard

### 3. Incident Management
- Create incidents when issues arise
- Add updates to keep users informed
- Resolve incidents when issues are fixed
- View incident history and timeline

### 4. Public Status Page
- Share your public status page: `http://localhost:5174/public/{your-org-slug}`
- Customers can check service status without authentication
- Real-time updates appear automatically

## 📁 Project Structure

```
Plivo-Assignment/
├── status-app/
│   ├── backend/
│   │   ├── app.py              # Main Flask application
│   │   ├── models.py           # Database models
│   │   ├── config.py           # Configuration settings
│   │   ├── requirements.txt    # Python dependencies
│   │   └── .env               # Environment variables
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── contexts/       # React context providers
│   │   │   ├── pages/          # Main application pages
│   │   │   ├── services/       # API and WebSocket services
│   │   │   └── lib/           # Utility functions
│   │   │
│   │   ├── package.json        # Node.js dependencies
│   │   ├── vite.config.js      # Vite configuration
│   │   └── tailwind.config.js  # Tailwind CSS config
│   │
│   └── README.md              # This file
│
├── .gitignore                 # Git ignore rules
└── SDE I FS.pdf              # Assignment requirements
```

## 🗄️ Database Schema

### Organizations
- `id`, `name`, `slug`, `created_at`

### Users
- `id`, `email`, `password_hash`, `name`, `role`, `organization_id`

### Services
- `id`, `name`, `description`, `status`, `organization_id`

### Incidents
- `id`, `title`, `description`, `status`, `impact`, `service_id`, `organization_id`

### Incident Updates
- `id`, `message`, `status`, `incident_id`, `created_by`


## 🔧 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database `status_app` exists

### Port Conflicts
- Backend default: `5000` (can be changed in `app.py`)
- Frontend default: `5174` (Vite will auto-increment if busy)

### Dependencies Issues
- Backend: Ensure virtual environment is activated
- Frontend: Try `npm install --force` if conflicts occur
