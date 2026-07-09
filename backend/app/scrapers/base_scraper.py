from abc import ABC, abstractmethod

class BaseScraper(ABC):
    """Every website scraper must implement this shape."""

    @abstractmethod
    def scrape(self, url: str) -> dict:
        """
        Must return a dictionary like:
        {
            "name": str,
            "price": float,
            "availability": bool,
            "image": str,
            "seller": str,
            "rating": float
        }
        """
        pass