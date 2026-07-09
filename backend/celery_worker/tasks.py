from celery_worker.celery_app import celery_app
from app.database.database import SessionLocal
from app.models.product import Product
from app.services.tracking_service import track_product

@celery_app.task
def track_all_products():
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.is_paused == False).all()
        for product in products:
            track_product(product.id, db)
    finally:
        db.close()

@celery_app.task
def track_single_product(product_id: int):
    db = SessionLocal()
    try:
        track_product(product_id, db)
    finally:
        db.close()