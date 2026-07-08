def get_returns_policy():
    """Retrieves the online golf store return policy."""
    return {
        "return_window": "30 days from delivery for most unused products.",
        "conditions": [
            "Items should be unused, in original packaging, and include tags or accessories.",
            "Golf balls, apparel, shoes, bags, and standard clubs follow the standard return window if unused.",
            "Custom-fit, personalized, final-sale, and heavily used items may be non-returnable or subject to restrictions.",
        ],
        "process": [
            "Start the return from the order history page.",
            "Print the return label or use the provided QR code when available.",
            "Refunds are generally issued to the original payment method after inspection.",
        ],
    }
