from typing import Any, Optional


def get_shipping_info(product_id: Optional[str] = None, destination_zip: Optional[str] = None) -> dict[str, Any]:
    """Retrieves shipping options, costs, and delivery estimates for golf-store purchases."""
    return {
        "product_id": product_id,
        "destination_zip": destination_zip,
        "options": [
            {
                "type": "Standard",
                "cost": "$7.99, free on orders over $99",
                "delivery_estimate": "3-5 business days",
            },
            {
                "type": "Express",
                "cost": "$19.99",
                "delivery_estimate": "1-2 business days",
            },
            {
                "type": "Oversize club or bag shipping",
                "cost": "Calculated at checkout",
                "delivery_estimate": "4-7 business days",
            },
        ],
        "notes": [
            "Final shipping costs and dates are confirmed at checkout.",
            "Custom-fit clubs may require additional build time before shipment.",
        ],
    }
