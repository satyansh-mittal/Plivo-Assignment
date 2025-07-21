@echo off
echo 🚀 Setting up Status Page App...

echo.
echo 📦 Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo 🗄️ Setting up database...
set FLASK_APP=app.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

echo.
echo 📦 Setting up frontend...
cd ..\frontend
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 🎉 To run the application:
echo 1. Start backend: cd backend && venv\Scripts\activate && python app.py
echo 2. Start frontend: cd frontend && npm run dev
echo 3. Open http://localhost:5173 in your browser
