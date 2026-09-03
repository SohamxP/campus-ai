from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    database_url: str

    openai_api_key: str
    openai_model: str = "gpt-5.6-luna"

    embedding_provider: str = "local"
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 384

    enable_reranker: bool = True

    frontend_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
