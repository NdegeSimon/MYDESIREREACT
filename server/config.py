 # Config (dev, prod, testing, DB URI, email settings)
import os
from datetime import timedelta


class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///salon.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS') or 'http://localhost:3000'