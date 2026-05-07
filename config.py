import os

import cloudinary
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ramsetu-divine-stones-secret-2024')

    # Supabase PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        os.environ.get(
            'SUPABASE_DATABASE_URL',
            'sqlite:////tmp/ramsetu.db' if os.environ.get('VERCEL') else 'sqlite:///ramsetu.db'
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = (
        {
            'pool_size': 5,
            'pool_recycle': 300,
            'pool_pre_ping': True,
            'max_overflow': 2,
        }
        if SQLALCHEMY_DATABASE_URI.startswith('postgresql')
        else {}
    )

    # Cloudinary
    CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    # Default admin credentials
    ADMIN_EMAIL = 'admin@ramsetu.com'
    ADMIN_PASSWORD = 'Admin@123'

    # Upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

    @staticmethod
    def init_cloudinary():
        if Config.CLOUDINARY_URL:
            cloudinary.config(cloudinary_url=Config.CLOUDINARY_URL, secure=True)
            return

        cloudinary.config(
            cloud_name=Config.CLOUDINARY_CLOUD_NAME,
            api_key=Config.CLOUDINARY_API_KEY,
            api_secret=Config.CLOUDINARY_API_SECRET,
            secure=True,
        )
