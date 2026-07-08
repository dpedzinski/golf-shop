def get_financing_options():
    """Provides available financing options, eligibility notes, fees, repayment periods, and responsible-purchasing caveats."""
    return {
        "financing_options": [
            {
                "name": "Store Credit Card",
                "summary": "Promotional APR may be available on qualifying golf purchases.",
                "example_terms": "0% promotional APR for 12 months on qualifying purchases over $500, then a variable APR may apply.",
                "fees": "Late fees or returned payment fees may apply.",
                "eligibility": "Subject to credit approval and offer terms.",
                "tradeoff": "Can be useful for planned larger purchases, but interest may be charged if the balance is not paid within the promotional period.",
            },
            {
                "name": "Installment Plan",
                "summary": "Split eligible purchases into fixed payments.",
                "example_terms": "3, 6, or 12 month repayment options may be shown at checkout.",
                "fees": "APR and fees vary by provider and eligibility.",
                "eligibility": "Subject to eligibility checks by the installment provider.",
                "tradeoff": "Predictable payments can help budgeting, but total cost may be higher if interest or fees apply.",
            },
            {
                "name": "Standard Card or Digital Wallet",
                "summary": "Pay in full at checkout with no store financing application.",
                "example_terms": "Card issuer terms apply.",
                "fees": "No store financing fee.",
                "eligibility": "Depends on payment method authorization.",
                "tradeoff": "Simpler and avoids store financing terms, but does not spread out payments through the store.",
            },
        ],
        "required_disclaimer": "Do not guarantee approval, rates, savings, or financial outcomes. Encourage the customer to review full terms and choose an option that fits their budget.",
    }
