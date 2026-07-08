def compare_products(product_ids):
    """Compares multiple golf products and returns practical tradeoffs for a shopper."""
    club_image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg"
    ball_image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg"

    comparison_data = {
        "CLUB-STRATA-SET": {
            "name": "Strata Ultimate Complete Golf Set",
            "price": "$499.99",
            "strength": "Lowest-cost complete beginner package",
            "tradeoff": "Less premium feel and fewer long-term upgrade features",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        "CLUB-CALLAWAY-EDGE": {
            "name": "Callaway Edge 10-Piece Set",
            "price": "$799.99",
            "strength": "Higher-quality beginner set with strong forgiveness",
            "tradeoff": "Higher upfront cost",
            "image_url": club_image,
            "imageUris": [club_image],
            "imageAlt": "Real golf clubs in a bag on a golf course.",
        },
        "BALL-TITLEIST-TRUFEEL": {
            "name": "Titleist TruFeel Golf Balls",
            "price": "$24.99",
            "strength": "Soft feel at a reasonable price",
            "tradeoff": "Less spin and tour performance than premium balls",
            "image_url": ball_image,
            "imageUris": [ball_image],
            "imageAlt": "Real white golf ball beside a cup on a putting green.",
        },
    }

    if not isinstance(product_ids, list):
        return {"error": True, "message": "product_ids must be a list of product IDs."}

    rows = []
    missing = []
    for product_id in product_ids:
        normalized = str(product_id).upper()
        product = comparison_data.get(normalized)
        if product:
            rows.append({"id": normalized, **product})
        else:
            missing.append(product_id)

    if missing:
        return {
            "error": True,
            "message": "One or more products were not found in the demo catalog.",
            "missing_product_ids": missing,
            "comparison": rows,
        }

    return {"comparison": rows}
