# 🔔 PricePulse

A full-stack app that tracks product prices on e-commerce sites and emails you when they drop. I built this to go deeper than a typical CRUD project — it's got real background job processing, actual browser-based web scraping, and historical price data, not just a form that saves to a database.

<img width="1586" height="696" alt="image" src="https://github.com/user-attachments/assets/4fb4b9e3-43ea-46da-8f16-0af685df0107" />


## What it does

You paste a product URL and set a target price. In the background, Playwright opens a real browser, scrapes the live price, and logs it. This happens automatically every few hours (and instantly when you first add a product), so your price history builds up over time — and the moment a price drops to or below your target, you get an email.

## How it's built

**Frontend:** React, Tailwind CSS, Axios, Recharts
**Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT auth
**Background jobs:** Celery + Redis
**Scraping:** Playwright (headless Chrome)

The core idea driving the architecture: scraping a live webpage takes 10-20 seconds, so it can't happen inside a normal API request — nobody wants to stare at a loading spinner that long. Instead, adding a product responds instantly, and a Celery worker picks up the actual scraping job in the background through a Redis queue.

## Screenshots

| Login | Dashboard |
<img width="398" height="420" alt="image" src="https://github.com/user-attachments/assets/d8173b9c-65ec-4a2c-a77a-a06d7413e702" />


| Tracked Products | Alerts |
<img width="935" height="685" alt="image" src="https://github.com/user-attachments/assets/f934e599-e45a-4715-be3d-d93da2624294" />
<img width="584" height="448" alt="image" src="https://github.com/user-attachments/assets/7045365e-6265-4afa-8a2d-965ea64f05f3" />


## Running it locally

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
playwright install
uvicorn app.main:app --reload

# Celery (separate terminals)
celery -A celery_worker.celery_app worker --loglevel=info --pool=solo
celery -A celery_worker.celery_app beat --loglevel=info

# Frontend
cd frontend
npm install
npm run dev
```

You'll also need a `.env` file in `backend/` with your database URL, a JWT secret, and SMTP credentials for email alerts.

## A few things I'd add next

- Support for more retailers (right now it's just Amazon — the scraper is built so adding a new site is just one new class)
- Proper retry logic when a scrape fails instead of failing silently
- Alembic migrations instead of manually altering tables

---

Built by [Gayatri Naik](https://github.com/gayatrinaik74)
