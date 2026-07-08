from typing import Any, Optional


def search_products(
    product_type: Optional[str] = None,
    skill_level: Optional[str] = None,
    budget_range: Optional[str] = None,
    playing_style: Optional[str] = None,
    brand: Optional[str] = None,
    product_category: Optional[str] = None,
    preferences: Optional[str] = None,
) -> dict[str, Any]:
    """Searches golf products using customer needs such as category, skill level, budget, brand, playing style, and preferences."""
    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"
    bag_image = "https://upload.wikimedia.org/wikipedia/commons/0/00/Golf_bag_near_green.jpg"
    shoe_image = "https://upload.wikimedia.org/wikipedia/commons/5/59/Golf_gear.jpg"

    catalog = [
        {
            "id": "CLUB-STRATA-SET",
            "name": "Strata Ultimate Complete Golf Set",
            "category": "clubs",
            "skill_level": "beginner",
            "price": 499.99,
            "brand": "Strata",
            "description": "Forgiving full set with driver, fairway wood, hybrid, irons, putter, and stand bag.",
            "fit": "Best for new golfers who want one affordable package.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        {
            "id": "CLUB-CALLAWAY-EDGE",
            "name": "Callaway Edge 10-Piece Set",
            "category": "clubs",
            "skill_level": "beginner",
            "price": 799.99,
            "brand": "Callaway",
            "description": "Higher-quality complete set with easy launch and strong forgiveness.",
            "fit": "Best for beginners who want room to improve without replacing clubs quickly.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        {
            "id": "P027",
            "name": "NorthLake Forge SoftStrike Forged Iron Set",
            "category": "irons",
            "product_category": "iron set",
            "skill_level": "experienced advanced low handicap",
            "price": 1299.99,
            "brand": "NorthLake Forge",
            "description": "Compact forged iron set for skilled ball strikers who want controlled launch and workability.",
            "fit": "Best for experienced players who want forged feel, compact shaping, and predictable gapping.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf irons in a bag on a golf course.",
        },
        {
            "id": "P024",
            "name": "NorthLake Forge TourPocket Pro Iron Set",
            "category": "irons",
            "product_category": "iron set",
            "skill_level": "experienced advanced low handicap",
            "price": 1199.99,
            "brand": "NorthLake Forge",
            "description": "Player-focused irons with forged construction and practical forgiveness.",
            "fit": "Best for confident iron players who want tour flight with a little launch help.",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf irons in a bag on a golf course.",
        },
        {
            "id": "BALL-TITLEIST-TRUFEEL",
            "name": "Titleist TruFeel Golf Balls",
            "category": "balls",
            "skill_level": "beginner",
            "price": 24.99,
            "brand": "Titleist",
            "description": "Soft-feel golf balls with good control at a moderate price.",
            "fit": "Best for players who value feel and short-game control.",
            "image_url": ball_image,
            "imageUris": [ball_image],
            "imageAlt": "Real white golf ball beside a cup on a putting green.",
        },
        {
            "id": "BAG-SUNMOUNTAIN-4PLUS",
            "name": "Sun Mountain 4.5LS Stand Bag",
            "category": "bags",
            "skill_level": "any",
            "price": 249.99,
            "brand": "Sun Mountain",
            "description": "Lightweight stand bag with comfortable straps and full-length dividers.",
            "fit": "Best for walking golfers who want organized club storage.",
            "image_url": bag_image,
            "imageUris": [bag_image],
            "imageAlt": "Real golf bag resting near a green.",
        },
        {
            "id": "SHOE-FOOTJOY-FUEL",
            "name": "FootJoy Fuel Golf Shoes",
            "category": "shoes",
            "skill_level": "any",
            "price": 129.99,
            "brand": "FootJoy",
            "description": "Spikeless waterproof golf shoes with stable traction.",
            "fit": "Best for comfort across walking rounds and range sessions.",
            "image_url": shoe_image,
            "imageUris": [shoe_image],
            "imageAlt": "Real golf shoes packed with golf bags.",
        },
    ]

    text = " ".join(
        str(value).lower()
        for value in [
            product_type,
            skill_level,
            budget_range,
            playing_style,
            brand,
            product_category,
            preferences,
        ]
        if value
    )

    def matches(product):
        haystack = " ".join(str(value).lower() for value in product.values())
        if not text:
            return True
        return any(token in haystack for token in text.replace("$", "").replace("-", " ").split())

    products = [product for product in catalog if matches(product)]
    if not products:
        return {
            "products": [],
            "message": "No exact demo-catalog matches were found. Try broadening the category, budget, brand, or preference.",
        }

    return {"products": products[:5]}
