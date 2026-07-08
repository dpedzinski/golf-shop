from typing import Any


def get_product_details(product_id: str) -> dict[str, Any]:
    """Retrieves detailed information for a specific golf product by product ID."""
    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"

    products = {
        "CLUB-STRATA-SET": {
            "id": "CLUB-STRATA-SET",
            "name": "Strata Ultimate Complete Golf Set",
            "price": "$499.99",
            "features": [
                "Forgiving driver and fairway wood",
                "Hybrid for easier long shots",
                "Cavity-back irons",
                "Mallet putter",
                "Lightweight stand bag",
            ],
            "availability": "In stock",
            "reviews": "4.5 out of 5 from 120 reviews",
            "best_for": "New golfers who want a complete, low-pressure starter set.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        "CLUB-CALLAWAY-EDGE": {
            "id": "CLUB-CALLAWAY-EDGE",
            "name": "Callaway Edge 10-Piece Set",
            "price": "$799.99",
            "features": [
                "Premium forgiving driver",
                "Easy-launch hybrid",
                "Game-improvement irons",
                "Odyssey-style putter",
            ],
            "availability": "Limited stock",
            "reviews": "4.7 out of 5 from 86 reviews",
            "best_for": "Beginners and casual golfers who want better build quality and room to grow.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        "P027": {
            "id": "P027",
            "name": "NorthLake Forge SoftStrike Forged Iron Set",
            "price": "$1,299.99",
            "features": [
                "Compact hollow-body forged construction",
                "Tour flight in scoring irons",
                "Minimal offset through the set",
                "Steel and graphite shaft options",
                "Custom fit recommended",
            ],
            "availability": "In stock",
            "reviews": "4.46 out of 5 from 432 reviews",
            "best_for": "Experienced players and skilled ball strikers who want workability and forged feel.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf irons in a bag on a golf course.",
        },
        "P024": {
            "id": "P024",
            "name": "NorthLake Forge TourPocket Pro Iron Set",
            "price": "$1,199.99",
            "features": [
                "One-piece forged carbon steel",
                "Tour flight launch profile",
                "Moderate offset for practical forgiveness",
                "6-PW, GW, SW set makeup",
            ],
            "availability": "Limited stock",
            "reviews": "4.02 out of 5 from 415 reviews",
            "best_for": "Confident iron players who want forged feel with a little launch help.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf irons in a bag on a golf course.",
        },
        "BALL-TITLEIST-TRUFEEL": {
            "id": "BALL-TITLEIST-TRUFEEL",
            "name": "Titleist TruFeel Golf Balls",
            "price": "$24.99",
            "features": ["Soft feel", "Good greenside control", "Consistent flight"],
            "availability": "In stock",
            "reviews": "4.6 out of 5 from 210 reviews",
            "best_for": "Golfers who want reliable feel without premium tour-ball pricing.",
            "image_url": ball_image,
            "imageUris": [ball_image],
            "imageAlt": "Real white golf ball beside a cup on a putting green.",
        },
    }

    product = products.get(str(product_id).upper())
    if not product:
        return {
            "error": True,
            "message": "Product not found in the demo catalog. Ask the customer for another product ID or run search_products.",
        }
    return product
