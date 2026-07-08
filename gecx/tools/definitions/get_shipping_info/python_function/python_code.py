import datetime
from typing import Any, Optional

def get_shipping_info(product_id: Optional[str] = None, destination_zip: Optional[str] = None) -> dict[str, Any]:
    """
    Retrieves shipping information, including estimated costs and delivery times.

    Args:
        product_id (Optional[str]): The ID of a specific product to get shipping estimates for.
        destination_zip (Optional[str]): The destination zip code for more accurate estimates.

    Returns:
        dict[str, Any]: A dictionary containing shipping options, estimated costs, and delivery dates.
              Example: {"options": [{"type": "Standard", "cost": "$7.99", "delivery_estimate": "3-5 business days", "estimated_date": "2023-11-20"}, {"type": "Express", "cost": "$19.99", "delivery_estimate": "1-2 business days", "estimated_date": "2023-11-17"}]}
              Example: {"error": True, "message": "Please provide a valid destination zip code."}
    """
    # MOCK: This mock provides static shipping information, with some dynamic date calculation.
    # In a real scenario, this would integrate with a shipping carrier's API.

    current_date_str = context.state.get("current_date", datetime.date.today().isoformat())
    current_date = datetime.date.fromisoformat(current_date_str)

    shipping_options = []

    # Default options
    standard_delivery_days = 5
    express_delivery_days = 2

    if destination_zip:
        if destination_zip.startswith("90210"): # Example for a specific zip code with faster shipping
            standard_delivery_days = 3
            express_delivery_days = 1
        elif destination_zip.startswith("100"): # Example for a specific zip code with slower shipping
            standard_delivery_days = 7
            express_delivery_days = 3
        elif not destination_zip.isdigit() or len(destination_zip) != 5:
            return {"error": True, "message": "I can't help with that. Please provide a valid 5-digit zip code."}

    standard_date = current_date + datetime.timedelta(days=standard_delivery_days)
    express_date = current_date + datetime.timedelta(days=express_delivery_days)

    shipping_options.append({
        "type": "Standard Shipping",
        "cost": "$7.99",
        "delivery_estimate": f"{standard_delivery_days} business days",
        "estimated_date": standard_date.isoformat()
    })
    shipping_options.append({
        "type": "Express Shipping",
        "cost": "$19.99",
        "delivery_estimate": f"{express_delivery_days} business days",
        "estimated_date": express_date.isoformat()
    })

    if product_id == "GC103": # Example for a heavy/oversized item
        shipping_options.append({
            "type": "Freight Shipping (Oversized)",
            "cost": "$75.00",
            "delivery_estimate": "7-10 business days",
            "estimated_date": (current_date + datetime.timedelta(days=10)).isoformat()
        })

    return {"options": shipping_options}