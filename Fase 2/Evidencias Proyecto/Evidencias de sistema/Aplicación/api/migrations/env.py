# migrations/env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig

# 1) Logging
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 2) Importa tus modelos y Base
from app.config import settings
from app.models.base import Base

# IMPORTA TODAS TUS TABLAS (un archivo por tabla)
from app.models.region import Region
from app.models.comuna import Comuna
from app.models.cesfam import Cesfam
# ... agrega aquí TODAS tus clases (paciente, cuidador, medicion, etc.)

# 3) Inyecta la URL desde tu Settings
config.set_main_option("sqlalchemy.url", settings.DB_URL)

# 4) Metadata objetivo
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,      # detecta cambios de tipos
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
