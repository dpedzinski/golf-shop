from typing import Any

def get_loyalty_program_details() -> dict[str, Any]:
    """
    Provides information about the store's loyalty rewards program, including points, discounts, and benefits.

    Returns:
        dict[str, Any]: A dictionary containing details about the loyalty program.
              Example: {"program_name": "Golf Pro Rewards", "benefits": ["Earn 1 point for every $1 spent", "Exclusive member discounts", "Early access to sales"], "how_to_redeem": "Points can be redeemed at checkout, 100 points = $1 off."}
    """
    # MOCK: This mock provides static information about the loyalty program.
    # In a real scenario, this would fetch current program details from a CRM or loyalty platform.

    loyalty_program = {
        "program_name": "Golf Pro Rewards Club",
        "benefits": [
            "Earn 1 point for every $1 spent on eligible purchases.",
            "Exclusive member-only discounts and promotions.",
            "Early access to new product launches and sales events.",
            "Birthday rewards and special anniversary offers.",
            "Free standard shipping on all orders for Gold tier members."
        ],
        "how_to_earn": "Automatically earn points when logged into your account during purchase. Points are awarded after order fulfillment.",
        "how_to_redeem": "Points can be redeemed at checkout. 100 points equals $1 off your purchase. Minimum redemption of 500 points ($5).",
        "tiers": [
            {"name": "Bronze", "requirements": "Join for free", "perks": "Earn 1 point per $1, member discounts."},
            {"name": "Silver", "requirements": "Spend $500 annually", "perks": "Earn 1.25 points per $1, enhanced discounts, birthday reward."},
            {"name": "Gold", "requirements": "Spend $1500 annually", "perks": "Earn 1.5 points per $1, VIP discounts, free standard shipping, early access."}
        ],
        "current_promotions": "Double points on all golf ball purchases this month!"
    }

    return {"loyalty_program": loyalty_program}