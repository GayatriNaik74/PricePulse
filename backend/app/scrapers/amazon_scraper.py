from playwright.sync_api import sync_playwright
from app.scrapers.base_scraper import BaseScraper

class AmazonScraper(BaseScraper):
    def scrape(self, url: str) -> dict:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=30000)
            page.wait_for_timeout(2000)  # give the page a moment to fully render

            try:
                name = page.locator("span#productTitle").inner_text().strip()
            except Exception as e:
                print("NAME EXTRACTION FAILED:", e)
                name = None

            try:
                price_text = page.locator(".a-price-whole").first.inner_text()
                price = float(price_text.replace(",", "").replace(".", ""))
            except Exception as e:
                print("PRICE EXTRACTION FAILED:", e)
                price = None

            try:
                image_locator = page.locator("#landingImage")
                print("IMAGE LOCATOR COUNT:", image_locator.count())
                image = image_locator.get_attribute("src")
                print("IMAGE URL FOUND:", image)
            except Exception as e:
                print("IMAGE EXTRACTION FAILED:", e)
                image = None

            availability = page.locator("#availability").inner_text().strip() if page.locator("#availability").count() > 0 else "Unknown"

            browser.close()

            return {
                "name": name,
                "price": price,
                "availability": "in stock" in availability.lower() if availability != "Unknown" else True,
                "image": image,
                "seller": "Amazon",
                "rating": None
            }