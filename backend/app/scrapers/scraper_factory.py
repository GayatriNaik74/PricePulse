from app.scrapers.amazon_scraper import AmazonScraper
# from app.scrapers.flipkart_scraper import FlipkartScraper  # add more later

def get_scraper(url: str):
    if "amazon" in url:
        return AmazonScraper()
    # elif "flipkart" in url:
    #     return FlipkartScraper()
    else:
        raise ValueError("No scraper available for this website yet")