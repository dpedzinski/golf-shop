def get_warranty_info(product_id=None):
    """Retrieves general or product-specific warranty information for golf products."""
    return {
        "product_id": product_id,
        "general_warranty": "Most golf products include a manufacturer warranty against defects in materials or workmanship.",
        "typical_coverage": [
            "Clubs: often 1-2 years for manufacturing defects.",
            "Bags: often 1 year for zippers, stands, and seams under normal use.",
            "Shoes: waterproof warranties vary by model and brand.",
            "Electronics and training aids: coverage varies by manufacturer.",
        ],
        "not_usually_covered": [
            "Normal wear and tear",
            "Misuse or accidental damage",
            "Unauthorized repairs or modifications",
        ],
        "next_step": "Use the product ID, order number, and photos of the issue when starting a warranty claim.",
    }
