# Status Page Application

A comprehensive, multi-tenant status page application built with Flask and React that allows organizations to manage and display the status of their services, incidents, and maintenance windows in real-time.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Organizations with isolated data and users
- **User Authentication**: JWT-based authentication with role management
- **Service Management**: Create, edit, and monitor services with different status levels
- **Incident Management**: Create, update, and resolve incidents with detailed timelines
- **Real-time Updates**: WebSocket-based live updates across all connected clients
- **Public Status Pages**: Customer-facing status displays for each organization

### User Roles
- **Organization Owner**: Full administrative access
- **Admin**: Manage services and incidents
- **User**: View organization's internal dashboard

### Service Statuses
- **Operational**: Service is working normally
- **Degraded Performance**: Service is experiencing minor issues
- **Partial Outage**: Some features are affected
- **Major Outage**: Service is significantly impacted
- **Under Maintenance**: Planned maintenance in progress

## 🛠️ Technology Stack

### Backend
- **Flask 2.3.3**: Web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-SocketIO**: Real-time WebSocket communication
- **Flask-CORS**: Cross-origin resource sharing
- **SQLite**: Database (development)
- **bcrypt**: Password hashing

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **ShadcnUI**: Component library
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time communication
- **Lucide React**: Icon library

## 📋 Project Structure

```
status-app/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   └── instance/
│       └── status_app.db   # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and WebSocket services
│   │   └── lib/            # Utilities
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # This file
```

## � Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd status-app/backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the Flask server**:
   ```bash
   python app.py
   ```

The backend will be available at `http://127.0.0.1:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd status-app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (or next available port)

### Quick Start (Windows)

Run the provided batch file from the root directory:
```bash
setup.bat
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Organizations
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/<id>` - Get organization details

### Services
- `GET /api/services` - List organization services
- `POST /api/services` - Create service
- `PUT /api/services/<id>` - Update service
- `DELETE /api/services/<id>` - Delete service

### Incidents
- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/<id>` - Update incident
- `POST /api/incidents/<id>/updates` - Add incident update

### Public API
- `GET /api/public/<org_slug>/status` - Public status page data

### WebSocket Events
- `status_update` - Real-time service status changes
- `incident_update` - Real-time incident updates

## 💡 Usage Guide

### Getting Started

1. **Register an Account**: Visit the application and create a new account
2. **Create Organization**: Set up your organization with a unique slug
3. **Add Services**: Define the services you want to monitor
4. **Manage Incidents**: Create and update incidents as they occur
5. **Share Status Page**: Use `/public/{your-org-slug}` URL for public access

### Managing Services

1. Click "Add Service" in the dashboard
2. Provide service name and description
3. Set initial status (defaults to Operational)
4. Save and the service will appear in your dashboard

### Handling Incidents

1. Click "Create Incident" when issues occur
2. Select affected services
3. Choose incident severity and status
4. Provide description and regular updates
5. Mark as resolved when fixed

### Public Status Page

- Accessible at `/public/{organization-slug}`
- Shows current service statuses
- Displays active and recent incidents
- Updates in real-time
- No authentication required

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: API endpoints protected by JWT tokens
- **Multi-tenant Isolation**: Organizations cannot access each other's data
- **CORS Configuration**: Controlled cross-origin access

## 🚀 Deployment

### Environment Variables
Create a `.env` file in the backend directory:

```env
FLASK_ENV=production
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=your-database-url
```

### Production Considerations
- Use PostgreSQL or MySQL for production database
- Set up reverse proxy (nginx)
- Use production WSGI server (gunicorn)
- Enable HTTPS
- Set up monitoring and logging
- Configure environment variables

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Organization creation
- [ ] Service management (CRUD)
- [ ] Incident management
- [ ] Real-time updates
- [ ] Public status page access
- [ ] Multi-tenant isolation

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📝 Assignment Requirements Compliance

This application fulfills all the requirements specified in the SDE I FS assignment:

✅ **User Authentication**: JWT-based authentication system
✅ **Team Management**: User roles and permissions within organizations
✅ **Organization (Multi-tenant)**: Complete multi-tenant architecture
✅ **Service Management**: Full CRUD operations for services
✅ **Incident/Maintenance Management**: Comprehensive incident system
✅ **Real-time Status Updates**: WebSocket-based live updates
✅ **Public Status Page**: Customer-facing status displays

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check existing documentation
2. Review API endpoints and responses
3. Test with provided examples
4. Create detailed issue reports

---

**Built with ❤️ for reliable status communication**

**MySQL Setup:**
1. Install and start MySQL Server
2. Create a MySQL database:
```sql
CREATE DATABASE status_app;
```

3. Update the `.env` file in the backend directory with your MySQL credentials:
```
MYSQL_URI=mysql+pymysql://your_username:your_password@localhost/status_app
```

**Quick MySQL Setup:**
- Run the SQL commands in `backend/mysql_setup.sql`
- Or use the setup script: `backend/setup_mysql.bat`

### 4. Running the Application

**Start Backend (Terminal 1):**
```bash
cd status-app/backend
venv\Scripts\activate  # On Windows
python app.py
```
Backend will run on `http://localhost:5000`

**Start Frontend (Terminal 2):**
```bash
cd status-app/frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### 5. Open Your Browser
Navigate to `http://localhost:5173` to use the application.

## ✨ Features

- ✅ Add new services
- ✅ View all services in a grid layout
- ✅ Toggle service status (operational/down)
- ✅ Real-time status updates
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ Shadcn/UI components

## 🎯 API Endpoints

- `GET /services` - List all services
- `POST /services` - Create a new service
- `PUT /services/<id>` - Toggle service status

## 🔧 Tech Stack

**Backend:**
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-CORS
- MySQL + PyMySQL

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Shadcn/UI
- Axios

## 🚨 Troubleshooting

1. **Database Connection Issues:**
   - Ensure MySQL server is running
   - Check credentials in `.env` file
   - Verify database `status_app` exists

2. **CORS Issues:**
   - Flask-CORS is configured to allow all origins
   - Backend should run on port 5000, frontend on 5173

3. **Module Import Errors:**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt` again

4. **Frontend Build Issues:**
   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js version is 16+
