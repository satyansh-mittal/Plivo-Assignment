-- MySQL Setup Script for Status Page App
-- Run these commands in MySQL command line or phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS status_app;

-- Use the database
USE status_app;

-- Create a user (optional - you can use root)
-- CREATE USER 'status_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON status_app.* TO 'status_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES;

-- The Flask application will create the tables automatically using migrations
