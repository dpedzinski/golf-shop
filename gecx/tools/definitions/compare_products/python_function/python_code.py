from typing import Any, List

def compare_products(product_ids: List[str]) -> dict[str, Any]:
    """
    Compares features and specifications of multiple golf products.

    Args:
        product_ids (List[str]): A list of unique identifiers for the products to compare.

    Returns:
        dict[str, Any]: A dictionary containing a comparison summary or an error if products are not found.
              Example: {"comparison": [{"id": "GC101", "name": "Strata Ultimate", "price": "$499.99", "key_feature": "Max Forgiveness"}, {"id": "GC103", "name": "Callaway Edge", "price": "$999.99", "key_feature": "Premium Forgiveness & Distance"}]}
              Example: {"error": True, "message": "Could not find details for one or more products."}
    """
    # MOCK: This mock fetches details for the given product IDs and presents a simplified comparison.
    # In a real scenario, this would aggregate data from a product catalog.

    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"

    mock_details = {
        "GC101": {"id": "GC101", "name": "Strata Ultimate Complete Golf Set", "price": "$499.99", "features": "Driver, 3W, 5H, 6-PW, Putter, Bag", "skill_level": "Beginner", "forgiveness": "High", "distance": "Good", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GC102": {"id": "GC102", "name": "Wilson Profile SGI Complete Set", "price": "$649.99", "features": "Driver, FW, Hybrid, 6-SW, Putter, Bag", "skill_level": "Beginner", "forgiveness": "High", "distance": "Good", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GC103": {"id": "GC103", "name": "Callaway Edge 10-Piece Set", "price": "$999.99", "features": "Driver, 3W, 5H, 6-PW, SW, Putter, Bag", "skill_level": "Beginner/Intermediate", "forgiveness": "Very High", "distance": "Excellent", "image_url": club_image, "imageUris": [club_image], "imageAlt": "Real golf clubs in a bag on a golf course."},
        "GB201": {"id": "GB201", "name": "Titleist Pro V1 Golf Balls", "price": "$49.99/dozen", "feel": "Soft", "spin": "High (Greenside)", "distance": "Long", "image_url": ball_image, "imageUris": [ball_image], "imageAlt": "Real white golf ball beside a cup on a putting green."},
        "GB202": {"id": "GB202", "name": "Callaway Supersoft Golf Balls", "price": "$24.99/dozen", "feel": "Ultra Soft", "spin": "Low", "distance": "Very Long", "image_url": ball_image, "imageUris": [ball_image], "imageAlt": "Real white golf ball beside a cup on a putting green."},
    }

    comparison_data = []
    for p_id in product_ids:
        details = mock_details.get(p_id)
        if details:
            comparison_data.append(details)
        else:
            return {"error": True, "message": f"Could not find details for product ID '{p_id}'. Please ensure all IDs are correct."}

    if len(comparison_data) < 2:
        return {"error": True, "message": "Please provide at least two product IDs to compare."}

    return {"comparison": comparison_data}
