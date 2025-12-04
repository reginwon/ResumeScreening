# Azure App Service startup command
gunicorn --bind=0.0.0.0:8000 --workers=4 --worker-class=uvicorn.workers.UvicornWorker --timeout=120 main:app
