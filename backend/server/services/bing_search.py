import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def search_bing(query: str) -> str:
    """
    Searches Bing and returns the HTML response.

    Args:
        query (str): The search query

    Returns:
        str: The HTML response from Bing
    """
    try:
        logger.info(f"Searching Bing for query: {query}")
        response = requests.get(f"https://www.bing.com/search?q={query}")
        logger.info(f"Bing search successful - Status code: {response.status_code}")
        return response.text
    except Exception as e:
        logger.error(f"Bing search error: {e}")
        return ""
