from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "pricepulse",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["celery_worker.tasks"]
)

# Run the tracking job every 3 hours
celery_app.conf.beat_schedule = {
    "track-all-products-every-3-hours": {
        "task": "celery_worker.tasks.track_all_products",
        "schedule": crontab(minute=0, hour="*/3"),
    },
}