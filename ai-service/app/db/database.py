import psycopg

from app.core_config import settings


def get_connection():
    return psycopg.connect(settings.database_url)
