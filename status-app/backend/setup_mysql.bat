@echo off
echo 🗄️ MySQL Setup for Status Page App
echo.

echo Please ensure MySQL Server is running and accessible.
echo.

echo 📋 Steps to complete setup:
echo 1. Start MySQL Server (if not running)
echo 2. Connect to MySQL as root user
echo 3. Run: CREATE DATABASE status_app;
echo 4. Update .env file with your MySQL credentials if different from:
echo    - Username: root
echo    - Password: password
echo    - Host: localhost
echo.

echo 🔧 Creating database and running migrations...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set Flask app
set FLASK_APP=app.py

REM Initialize migrations
echo Initializing migrations...
flask db init

REM Create migration
echo Creating migration...
flask db migrate -m "Initial migration"

REM Apply migration
echo Applying migration...
flask db upgrade

echo.
echo ✅ Database setup complete!
echo.
echo 🚀 You can now run the application:
echo Backend: python app.py
echo Frontend: cd ..\frontend && npm run dev
