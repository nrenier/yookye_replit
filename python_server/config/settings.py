import os
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# OpenSearch configuration
OPENSEARCH_HOST = os.getenv("OPENSEARCH_HOST", "localhost")
OPENSEARCH_PORT = int(os.getenv("OPENSEARCH_PORT", 9200))
OPENSEARCH_USERNAME = os.getenv("OPENSEARCH_USERNAME", "")
OPENSEARCH_PASSWORD = os.getenv("OPENSEARCH_PASSWORD", "")
OPENSEARCH_USE_SSL = os.getenv("OPENSEARCH_USE_SSL", "false").lower() == "true"
OPENSEARCH_VERIFY_CERTS = os.getenv("OPENSEARCH_VERIFY_CERTS", "false").lower() == "true"

# Application settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))  # 1 ora

# Nomi degli indici OpenSearch
INDEX_USERS = "yookve_users"
INDEX_PREFERENCES = "yookve_preferences"
INDEX_TRAVEL_PACKAGES = "yookve_travel_packages"
INDEX_BOOKINGS = "yookve_bookings"

# OpenSearch mappings per gli indici
MAPPINGS = {
    INDEX_USERS: {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "username": {"type": "keyword"},
                "password": {"type": "keyword"},
                "name": {"type": "text"},
                "email": {"type": "keyword"}
            }
        }
    },
    INDEX_PREFERENCES: {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "userId": {"type": "keyword"},
                "destination": {"type": "text"},
                "travelType": {"type": "keyword"},
                "interests": {"type": "keyword"},
                "budget": {"type": "integer"},
                "departureDate": {"type": "date"},
                "returnDate": {"type": "date"},
                "numAdults": {"type": "integer"},
                "numChildren": {"type": "integer"},
                "numInfants": {"type": "integer"},
                "accommodationType": {"type": "keyword"},
                "createdAt": {"type": "date"}
            }
        }
    },
    INDEX_TRAVEL_PACKAGES: {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "title": {"type": "text"},
                "description": {"type": "text"},
                "destination": {"type": "text"},
                "imageUrl": {"type": "keyword"},
                "rating": {"type": "keyword"},
                "reviewCount": {"type": "integer"},
                "accommodationName": {"type": "text"},
                "accommodationType": {"type": "keyword"},
                "transportType": {"type": "keyword"},
                "durationDays": {"type": "integer"},
                "durationNights": {"type": "integer"},
                "experiences": {"type": "text"},
                "price": {"type": "integer"},
                "isRecommended": {"type": "boolean"},
                "categories": {"type": "keyword"}
            }
        }
    },
    INDEX_BOOKINGS: {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "userId": {"type": "keyword"},
                "packageId": {"type": "keyword"},
                "bookingDate": {"type": "date"},
                "travelDate": {"type": "date"},
                "returnDate": {"type": "date"},
                "numAdults": {"type": "integer"},
                "numChildren": {"type": "integer"},
                "numInfants": {"type": "integer"},
                "totalPrice": {"type": "integer"},
                "specialRequests": {"type": "text"},
                "status": {"type": "keyword"},
                "paymentStatus": {"type": "keyword"},
                "contactPhone": {"type": "keyword"},
                "contactEmail": {"type": "keyword"}
            }
        }
    }
}