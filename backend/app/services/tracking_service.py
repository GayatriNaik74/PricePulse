from sqlalchemy.orm import Session
from datetime import datetime
from app.models.product import Product
from app.models.price_history import PriceHistory
from app.models.user import User
from app.scrapers.scraper_factory import get_scraper
from app.alerts.email_service import send_email

def track_product(product_id: int, db: Session):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or product.is_paused:
        return

    scraper = get_scraper(product.url)
    result = scraper.scrape(product.url)

    old_price = product.current_price

    # Update product with fresh data
    product.name = result["name"] or product.name
    product.image = result["image"] or product.image
    product.current_price = result["price"]
    product.availability = result["availability"]
    product.last_checked = datetime.utcnow()
    db.commit()

    # Save to price history
    if result["price"] is not None:
        history_entry = PriceHistory(product_id=product.id, price=result["price"])
        db.add(history_entry)
        db.commit()

    # Check if we should send an alert
    user = db.query(User).filter(User.id == product.user_id).first()
    if result["price"] is not None and result["price"] <= product.target_price:
        send_email(
            to_email=user.email,
            subject=f"Price Drop Alert: {product.name}",
            body=f"Good news! {product.name} is now ₹{result['price']}, which is at or below your target of ₹{product.target_price}.\n\nCheck it out: {product.url}"
        )