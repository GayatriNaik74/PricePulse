from celery_worker.tasks import track_single_product
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductOut
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductOut, ProductUpdate
from app.models.price_history import PriceHistory


router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/price-history/all")
def get_all_price_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(Product.user_id == current_user.id).all()
    product_ids = [p.id for p in products]
    history = db.query(PriceHistory).filter(PriceHistory.product_id.in_(product_ids)).order_by(PriceHistory.date).all()
    return [
        {"product_id": h.product_id, "price": h.price, "date": h.date}
        for h in history
    ]

@router.patch("/{product_id}", response_model=ProductOut)
def update_target_price(product_id: int, update: ProductUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.target_price = update.target_price
    db.commit()
    db.refresh(product)
    return product

@router.post("/", response_model=ProductOut)
def add_product(product: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_product = Product(
        user_id=current_user.id,
        url=product.url,
        target_price=product.target_price
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Trigger scraping immediately in the background, don't make the user wait for the response
    track_single_product.delay(new_product.id)

    return new_product

@router.get("/", response_model=List[ProductOut])
def get_my_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Product).filter(Product.user_id == current_user.id).all()

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}

@router.patch("/{product_id}/pause")
def pause_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_paused = True
    db.commit()
    return {"message": "Tracking paused"}

@router.patch("/{product_id}/resume")
def resume_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_paused = False
    db.commit()
    return {"message": "Tracking resumed"}