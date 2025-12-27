FROM python:3.10-slim

# 1. Install 'uv' directly from its official image
# This copies a single static binary. It's tiny and instant.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /code

# 2. Copy ONLY the project definition first (for Docker caching)
COPY pyproject.toml .

# 3. Use uv to resolve and install dependencies system-wide
# We compile the TOML to a requirements list in memory, then install it.
# --system: Installs to Python's global environment (so no venv needed inside Docker)
RUN uv pip install --system --no-cache -r requirements.txt

# 4. Create a non-root user with the same UID and GID as the host
# This avoids permission issues with mounted volumes.
ARG UID=1000
ARG GID=1000
RUN groupadd --gid $GID user && \
    useradd --uid $UID --gid $GID -m user

# 5. Copy the application code and set permissions
COPY --chown=user:user ./app ./app

# 6. Switch to the non-root user
USER user

EXPOSE 80

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]