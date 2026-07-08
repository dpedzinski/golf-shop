import datetime
from typing import Any, Optional

def search_products(product_type: Optional[str] = None, skill_level: Optional[str] = None, budget_range: Optional[str] = None, playing_style: Optional[str] = None, brand: Optional[str] = None, product_category: Optional[str] = None, preferences: Optional[str] = None) -> dict[str, Any]:
    """
    Searches for golf products based on various criteria provided by the customer.

    Args:
        product_type (Optional[str]): The general type of golf product (e.g., "golf clubs", "golf balls", "apparel").
        skill_level (Optional[str]): The customer's skill level (e.g., "beginner", "intermediate", "advanced").
        budget_range (Optional[str]): The customer's budget range (e.g., "under $500", "$500-$1000", "premium").
        playing_style (Optional[str]): The customer's playing style (e.g., "aggressive", "finesse", "casual").
        brand (Optional[str]): A specific brand the customer is interested in.
        product_category (Optional[str]): A more specific category within a product type (e.g., "full set", "driver", "putter").
        preferences (Optional[str]): Any specific preferences (e.g., "forgiving", "distance", "control", "waterproof").

    Returns:
        dict[str, Any]: A dictionary containing a list of matching products, each with an ID, name, and brief description.
              Example: {"products": [{"id": "GC101", "name": "Strata Ultimate Complete Golf Set", "description": "Great for beginners, includes all essential clubs, very forgiving."}]}
              Example: {"products": [], "message": "No products found matching your criteria."}
    """
    # MOCK: This mock simulates a product search. It has a few hardcoded products
    # and tries to match based on keywords. In a real scenario, this would query a product database.

    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"
    apparel_image = "https://upload.wikimedia.org/wikipedia/commons/d/de/Paula_Creamer_IMG_0686_%286376796787%29.jpg"
    shoe_image = "https://upload.wikimedia.org/wikipedia/commons/5/59/Golf_gear.jpg"
    trainer_image = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Golfer_swing.jpg"

    mock_products = [
        {
            "id": "GC101",
            "name": "Strata Ultimate Complete Golf Set",
            "product_type": "golf clubs",
            "skill_level": "beginner",
            "budget_range": "under $500",
            "product_category": "full set",
            "preferences": "forgiving",
            "brand": "Strata",
            "description": "Forgiving complete set with driver, woods, irons, putter, and bag.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        {
            "id": "GC102",
            "name": "Wilson Profile SGI Complete Set",
            "product_type": "golf clubs",
            "skill_level": "beginner",
            "budget_range": "under $700",
            "product_category": "full set",
            "preferences": "forgiving, lightweight",
            "brand": "Wilson",
            "description": "Lightweight complete golf set for newer players.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        {
            "id": "GC103",
            "name": "Callaway Edge 10-Piece Set",
            "product_type": "golf clubs",
            "skill_level": "beginner",
            "budget_range": "under $1000",
            "product_category": "full set",
            "preferences": "forgiving, distance",
            "brand": "Callaway",
            "description": "Forgiving 10-piece complete set with easy launch and distance.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        {
            "id": "GB201",
            "name": "Titleist Pro V1 Golf Balls (Dozen)",
            "product_type": "golf balls",
            "skill_level": "advanced",
            "budget_range": "premium",
            "preferences": "distance, control",
            "brand": "Titleist",
            "description": "Premium golf balls for distance, spin, and greenside control.",
            "image_url": ball_image,
            "imageUris": [ball_image],
            "imageAlt": "Real white golf ball beside a cup on a putting green.",
        },
        {
            "id": "GB202",
            "name": "Callaway Supersoft Golf Balls (Dozen)",
            "product_type": "golf balls",
            "skill_level": "all",
            "budget_range": "mid-range",
            "preferences": "soft feel, distance",
            "brand": "Callaway",
            "description": "Soft-feel golf balls with low compression and easy distance.",
            "image_url": ball_image,
            "imageUris": [ball_image],
            "imageAlt": "Real white golf ball beside a cup on a putting green.",
        },
        {
            "id": "GA301",
            "name": "Puma Golf Polo Shirt",
            "product_type": "apparel",
            "preferences": "breathable, stylish",
            "brand": "Puma",
            "description": "Breathable golf polo for warm-weather rounds.",
            "image_url": apparel_image,
            "imageUris": [apparel_image],
            "imageAlt": "Golfer wearing a pink golf polo on the course.",
        },
        {
            "id": "GS401",
            "name": "FootJoy Flex XP Golf Shoes",
            "product_type": "shoes",
            "preferences": "waterproof, comfortable",
            "brand": "FootJoy",
            "description": "Waterproof golf shoes built for walking comfort.",
            "image_url": shoe_image,
            "imageUris": [shoe_image],
            "imageAlt": "Real golf shoes packed with golf bags.",
        },
        {
            "id": "GT501",
            "name": "SKLZ Gold Flex Golf Swing Trainer",
            "product_type": "training aids",
            "skill_level": "all",
            "preferences": "swing speed, flexibility",
            "brand": "SKLZ",
            "description": "Training aid for building swing speed, tempo, and flexibility.",
            "image_url": trainer_image,
            "imageUris": [trainer_image],
            "imageAlt": "Golfer swinging on a tee box during practice.",
        },
    ]

    results = []
    for product in mock_products:
        match = True
        if product_type and product_type.lower() not in product.get("product_type", "").lower():
            match = False
        if skill_level and skill_level.lower() not in product.get("skill_level", "").lower() and product.get("skill_level", "").lower() != "all":
            match = False
        if budget_range:
            # Simple budget range matching (can be more complex)
            if "under $500" in budget_range.lower() and product.get("budget_range", "").lower() not in ["under $500", "mid-range"]:
                match = False
            elif "$500-$1000" in budget_range.lower() and product.get("budget_range", "").lower() not in ["under $700", "under $1000", "mid-range"]:
                match = False
            elif "premium" in budget_range.lower() and product.get("budget_range", "").lower() != "premium":
                match = False
        if playing_style and playing_style.lower() not in product.get("playing_style", "").lower():
            match = False
        if brand and brand.lower() not in product.get("brand", "").lower():
            match = False
        if product_category and product_category.lower() not in product.get("product_category", "").lower():
            match = False
        if preferences and preferences.lower() not in product.get("preferences", "").lower():
            match = False

        if match:
            results.append({
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "image_url": product["image_url"],
                "imageUris": product["imageUris"],
                "imageAlt": product["imageAlt"],
            })

    if results:
        return {"products": results}
    else:
        return {"products": [], "message": "No products found matching your criteria. Please try adjusting your search."}
