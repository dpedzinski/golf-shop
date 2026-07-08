from typing import Any


def get_checkout_guidance() -> dict[str, Any]:
    """Returns checkout guidance for cart review, payment, discounts, financing, loyalty rewards, and order confirmation."""
    return {
        "steps": [
            "Review product fit, size, dexterity, shaft flex, color, and quantity before checkout.",
            "Apply promo codes, gift cards, or loyalty points before selecting payment.",
            "Choose shipping speed and confirm the delivery address.",
            "Select payment method, financing, or installment plan if eligible.",
            "Review estimated taxes, shipping, fees, and final order total before placing the order.",
            "Save the order confirmation for returns, warranties, and support.",
        ],
        "reminder": "Financing and promotional offers may require approval and can include interest or fees. Customers should review terms before choosing them.",
    }
