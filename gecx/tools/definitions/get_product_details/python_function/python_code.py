from typing import Any, Optional

def get_product_details(product_id: str) -> dict[str, Any]:
    """
    Retrieves detailed information about a specific golf product.

    Args:
        product_id (str): The unique identifier of the product.

    Returns:
        dict[str, Any]: A dictionary containing detailed product information, or an error message if not found.
              Example: {"id": "GC101", "name": "Strata Ultimate Complete Golf Set", "price": "$499.99", "features": ["Driver", "3 Wood", "5 Hybrid", "6-PW Irons", "Putter", "Stand Bag"], "reviews": "4.5/5 stars from 120 reviews", "availability": "In Stock"}
              Example: {"error": True, "message": "Product with ID 'XYZ' not found."}
    """
    # MOCK: This mock provides detailed information for a few hardcoded products.
    # In a real scenario, this would query a product information system.

    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"
    apparel_image = "https://upload.wikimedia.org/wikipedia/commons/d/de/Paula_Creamer_IMG_0686_%286376796787%29.jpg"
    shoe_image = "https://upload.wikimedia.org/wikipedia/commons/5/59/Golf_gear.jpg"
    trainer_image = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Golfer_swing.jpg"

    mock_details = {
        "GC101": {"id": "GC101", "name": "Strata Ultimate Complete Golf Set", "price": "$499.99", "features": ["Driver", "3 Wood", "5 Hybrid", "6-PW Irons", "Putter", "Stand Bag", "Designed for maximum forgiveness"], "reviews": "4.5/5 stars from 120 reviews", "availability": "In Stock", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GC102": {"id": "GC102", "name": "Wilson Profile SGI Complete Set", "price": "$649.99", "features": ["Driver", "Fairway Wood", "Hybrid", "Irons (6-SW)", "Putter", "Carry Bag", "Lightweight components for easier swings"], "reviews": "4.3/5 stars from 95 reviews", "availability": "In Stock", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GC103": {"id": "GC103", "name": "Callaway Edge 10-Piece Set", "price": "$999.99", "features": ["Driver", "3 Wood", "5 Hybrid", "6-PW Irons", "Sand Wedge", "Putter", "Stand Bag", "Premium materials, excellent distance and forgiveness"], "reviews": "4.8/5 stars from 210 reviews", "availability": "Low Stock", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GB201": {"id": "GB201", "name": "Titleist Pro V1 Golf Balls (Dozen)", "price": "$49.99", "features": ["High velocity, low spin", "Exceptional greenside control", "Soft feel"], "reviews": "4.9/5 stars from 500+ reviews", "availability": "In Stock", "image_url": ball_image, "imageUris": [ball_image], "imageAlt": "Real white golf ball beside a cup on a putting green."},
        "GB202": {"id": "GB202", "name": "Callaway Supersoft Golf Balls (Dozen)", "price": "$24.99", "features": ["Ultra-low compression core", "Soft feel", "Increased distance"], "reviews": "4.7/5 stars from 300+ reviews", "availability": "In Stock", "image_url": ball_image, "imageUris": [ball_image], "imageAlt": "Real white golf ball beside a cup on a putting green."},
        "GA301": {"id": "GA301", "name": "Puma Golf Polo Shirt", "price": "$65.00", "features": ["Moisture-wicking fabric", "UV protection", "Stylish design"], "reviews": "4.6/5 stars from 80 reviews", "availability": "Available in S, M, L, XL", "image_url": apparel_image, "imageUris": [apparel_image], "imageAlt": "Golfer wearing a pink golf polo on the course."},
        "GS401": {"id": "GS401", "name": "FootJoy Flex XP Golf Shoes", "price": "$129.99", "features": ["100% Waterproof", "Versatile traction", "Lightweight cushioning"], "reviews": "4.7/5 stars from 150 reviews", "availability": "Available in various sizes", "image_url": shoe_image, "imageUris": [shoe_image], "imageAlt": "Real golf shoes packed with golf bags."},
        "GT501": {"id": "GT501", "name": "SKLZ Gold Flex Golf Swing Trainer", "price": "$69.99", "features": ["Improves swing tempo and strength", "Flexible shaft", "Weighted head"], "reviews": "4.4/5 stars from 70 reviews", "availability": "In Stock", "image_url": trainer_image, "imageUris": [trainer_image], "imageAlt": "Golfer swinging on a tee box during practice."},
    }

    details = mock_details.get(product_id)
    if details:
        return details
    else:
        return {"error": True, "message": f"Product with ID '{product_id}' not found. Please check the product ID."}
