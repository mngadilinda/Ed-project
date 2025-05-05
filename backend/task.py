# tasks.py
from celery import shared_task
from .services import process_content_upload

@shared_task(bind=True, max_retries=3)
def process_upload_task(self, upload_id):
    try:
        process_content_upload(upload_id)
    except Exception as e:
        self.retry(exc=e, countdown=60)