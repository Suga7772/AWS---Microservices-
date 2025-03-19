# Use Python base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy files
COPY requirements.txt requirements.txt
COPY app.py app.py
COPY config.yaml config.yaml

# Install dependencies
RUN pip install -r requirements.txt

# Expose port
EXPOSE 3005

# Command to run app
CMD ["python", "app.py"]
