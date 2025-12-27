FROM python:3.10-slim

WORKDIR /app

# First, install all dependencies as the root user
RUN pip install uv
COPY pyproject.toml .
RUN uv pip compile pyproject.toml -o requirements.txt
RUN uv pip install --system --no-cache -r requirements.txt

# Create a non-root user with the same UID and GID as the host
# This avoids permission issues with mounted volumes.
ARG UID=1000
ARG GID=1000
RUN groupadd --gid $GID user && \
    useradd --uid $UID --gid $GID -m user

# Now, copy the application code and set permissions
COPY --chown=user:user ./app /app/app
COPY --chown=user:user ./templates /app/templates

# Switch to the non-root user
USER user

ENV PYTHONPATH=/app

CMD ["python", "app/server.py"]