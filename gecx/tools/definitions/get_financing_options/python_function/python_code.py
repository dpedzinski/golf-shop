from typing import Any

def get_financing_options() -> dict[str, Any]:
    """
    Provides information about available financing options for purchases at the golf store.

    Returns:
        dict[str, Any]: A dictionary containing a list of financing options with their details.
              Example: {"financing_options": [{"name": "Store Credit Card", "details": "0% APR for 12 months on purchases over $500, then variable APR. Rewards points on all purchases. Subject to credit approval."}]}
    """
    # MOCK: This mock provides static information about financing options.
    # In a real scenario, this would fetch current financing offers from a financial service provider.

    financing_options = [
        {
            "name": "Store Credit Card",
            "details": "Apply for our Golf Pro Store Credit Card! Get 0% APR for 12 months on purchases over $500, then a variable APR (currently 24.99%). Earn 5% back in rewards points on all store purchases. Subject to credit approval and terms & conditions. Minimum monthly payments required.",
            "eligibility": "Subject to credit approval. Must be 18+ with a valid SSN.",
            "fees": "No annual fee.",
            "repayment_period": "Promotional 0% APR for 12 months, standard repayment terms apply thereafter."
        },
        {
            "name": "Installment Plan (via Affirm)",
            "details": "Pay for your purchase in 3, 6, or 12 monthly installments with Affirm. Rates from 0-30% APR based on creditworthiness. Subject to eligibility check and approval by Affirm. No hidden fees.",
            "eligibility": "Subject to Affirm's eligibility criteria and credit check.",
            "fees": "No late fees or prepayment fees.",
            "repayment_period": "3, 6, or 12 months, chosen at checkout."
        },
        {
            "name": "PayPal Credit",
            "details": "Enjoy No Interest if paid in full in 6 months on purchases of $99 or more with PayPal Credit. Subject to credit approval. Minimum monthly payments required.",
            "eligibility": "Subject to PayPal Credit approval.",
            "fees": "No annual fee.",
            "repayment_period": "6 months promotional period for purchases over $99."
        }
    ]

    return {"financing_options": financing_options}