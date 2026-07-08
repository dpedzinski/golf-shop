import json
import os

import requests
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import id_token


PRODUCT_API_BASE_URL = os.environ["PRODUCT_API_BASE_URL"].rstrip("/")
PRODUCT_API_AUDIENCE = os.environ.get("PRODUCT_API_AUDIENCE", PRODUCT_API_BASE_URL)
PRODUCT_API_AUTH_MODE = os.environ.get("PRODUCT_API_AUTH_MODE", "none")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")

MCP_PROTOCOL_VERSION = "2025-03-26"


def _headers(content_type="application/json"):
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,Mcp-Session-Id",
        "Content-Type": content_type,
    }


def _response(body, status=200):
    return json.dumps(body), status, _headers()


def _api_headers():
    headers = {"Accept": "application/json"}
    if PRODUCT_API_AUTH_MODE == "google_id_token":
        token = id_token.fetch_id_token(GoogleAuthRequest(), PRODUCT_API_AUDIENCE)
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _api_get(path, params=None):
    response = requests.get(
        f"{PRODUCT_API_BASE_URL}{path}",
        params=params or {},
        headers=_api_headers(),
        timeout=45,
    )
    response.raise_for_status()
    return response.json()


def _api_post(path, payload):
    response = requests.post(
        f"{PRODUCT_API_BASE_URL}{path}",
        json=payload,
        headers=_api_headers(),
        timeout=45,
    )
    response.raise_for_status()
    return response.json()


TOOLS = [
    {
        "name": "search_products",
        "description": "Search BigQuery-backed golf products by keyword, category, brand, skill level, budget, and limit.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "q": {"type": "string", "description": "Keyword such as driver, wedge, shoes, beginner, waterproof."},
                "category": {"type": "string", "description": "Category or parent category."},
                "brand": {"type": "string", "description": "Brand name."},
                "skill_level": {"type": "string", "description": "Skill level or handicap range."},
                "max_price": {"type": "number", "description": "Maximum current sale price."},
                "limit": {"type": "integer", "minimum": 1, "maximum": 50, "default": 10},
            },
        },
    },
    {
        "name": "get_product_details",
        "description": "Get all catalog, inventory, pricing, specs, tags, and review fields for a product ID.",
        "inputSchema": {
            "type": "object",
            "properties": {"product_id": {"type": "string"}},
            "required": ["product_id"],
        },
    },
    {
        "name": "compare_products",
        "description": "Compare multiple products by price range, category, profile, inventory, rating, and review snippets.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "product_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                }
            },
            "required": ["product_ids"],
        },
    },
    {
        "name": "get_category_margin_summary",
        "description": "List category-level product counts, average sale price, margin, sales, returns, and ratings.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_low_stock_best_sellers",
        "description": "List products that are both low stock and selling well.",
        "inputSchema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20}},
        },
    },
    {
        "name": "get_financing_options",
        "description": "List all active financing options, including store card offers and installment plans. Optionally filter by purchase amount.",
        "inputSchema": {
            "type": "object",
            "properties": {"amount": {"type": "number", "description": "Optional cart or product amount."}},
        },
    },
    {
        "name": "get_card_offers",
        "description": "List active store credit card and co-branded card offers with APR, fees, rewards, eligibility, and responsible-use notes.",
        "inputSchema": {
            "type": "object",
            "properties": {"amount": {"type": "number", "description": "Optional cart or product amount."}},
        },
    },
    {
        "name": "get_installment_plans",
        "description": "List active installment financing plans with term lengths, APR ranges, repayment notes, and eligibility notes.",
        "inputSchema": {
            "type": "object",
            "properties": {"amount": {"type": "number", "description": "Optional cart or product amount."}},
        },
    },
    {
        "name": "get_loyalty_program_details",
        "description": "List loyalty program tiers, points earning, redemption value, member discounts, shipping thresholds, and benefits.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_active_promotions",
        "description": "List active promotions, optionally filtered by product ID or category.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Optional category ID or category name."},
                "product_id": {"type": "string", "description": "Optional product ID."},
            },
        },
    },
    {
        "name": "get_shipping_info",
        "description": "List shipping service levels, fees, free-shipping thresholds, delivery estimates, and oversize rules.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_returns_policy",
        "description": "List return policies, optionally filtered by category ID or category name.",
        "inputSchema": {
            "type": "object",
            "properties": {"category": {"type": "string", "description": "Optional category ID or category name."}},
        },
    },
    {
        "name": "get_warranty_info",
        "description": "List warranty policies, optionally filtered by category ID or category name.",
        "inputSchema": {
            "type": "object",
            "properties": {"category": {"type": "string", "description": "Optional category ID or category name."}},
        },
    },
    {
        "name": "get_checkout_guidance",
        "description": "List checkout guidance steps covering cart review, discounts, loyalty, financing, shipping, and confirmation.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def _tool_result(data):
    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps(data, indent=2, sort_keys=True),
            }
        ],
        "isError": False,
    }


def _call_tool(name, arguments):
    arguments = arguments or {}
    if name == "search_products":
        params = {
            key: arguments[key]
            for key in ["q", "category", "brand", "skill_level", "max_price", "limit"]
            if arguments.get(key) is not None
        }
        return _tool_result(_api_get("/products", params))
    if name == "get_product_details":
        return _tool_result(_api_get(f"/products/{arguments['product_id']}"))
    if name == "compare_products":
        return _tool_result(_api_post("/compare", {"product_ids": arguments["product_ids"]}))
    if name == "get_category_margin_summary":
        return _tool_result(_api_get("/categories"))
    if name == "get_low_stock_best_sellers":
        return _tool_result(_api_get("/low-stock", {"limit": arguments.get("limit", 20)}))
    if name == "get_financing_options":
        params = {"amount": arguments["amount"]} if arguments.get("amount") is not None else {}
        return _tool_result(_api_get("/financing", params))
    if name == "get_card_offers":
        params = {"amount": arguments["amount"]} if arguments.get("amount") is not None else {}
        return _tool_result(_api_get("/card-offers", params))
    if name == "get_installment_plans":
        params = {"amount": arguments["amount"]} if arguments.get("amount") is not None else {}
        return _tool_result(_api_get("/installment-plans", params))
    if name == "get_loyalty_program_details":
        return _tool_result(_api_get("/loyalty"))
    if name == "get_active_promotions":
        params = {
            key: arguments[key]
            for key in ["category", "product_id"]
            if arguments.get(key) is not None
        }
        return _tool_result(_api_get("/promotions", params))
    if name == "get_shipping_info":
        return _tool_result(_api_get("/shipping"))
    if name == "get_returns_policy":
        params = {"category": arguments["category"]} if arguments.get("category") is not None else {}
        return _tool_result(_api_get("/returns", params))
    if name == "get_warranty_info":
        params = {"category": arguments["category"]} if arguments.get("category") is not None else {}
        return _tool_result(_api_get("/warranties", params))
    if name == "get_checkout_guidance":
        return _tool_result(_api_get("/checkout-guidance"))
    raise ValueError(f"Unknown tool: {name}")


def _jsonrpc_result(request_id, result):
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def _jsonrpc_error(request_id, code, message):
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}


def _handle_jsonrpc(message):
    request_id = message.get("id")
    method = message.get("method")
    params = message.get("params") or {}

    if method == "initialize":
        return _jsonrpc_result(
            request_id,
            {
                "protocolVersion": MCP_PROTOCOL_VERSION,
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "golf-store-bigquery-mcp", "version": "0.1.0"},
            },
        )
    if method == "tools/list":
        return _jsonrpc_result(request_id, {"tools": TOOLS})
    if method == "tools/call":
        name = params.get("name")
        arguments = params.get("arguments") or {}
        try:
            return _jsonrpc_result(request_id, _call_tool(name, arguments))
        except Exception as exc:
            return _jsonrpc_error(request_id, -32000, str(exc))
    if method and request_id is None:
        return None
    return _jsonrpc_error(request_id, -32601, f"Method not found: {method}")


def handle_request(request):
    if request.method == "OPTIONS":
        return "", 204, _headers()

    path = request.path.rstrip("/") or "/"
    if request.method == "GET" and path in {"/", "/health", "/mcp"}:
        return _response(
            {
                "status": "ok",
                "protocolVersion": MCP_PROTOCOL_VERSION,
                "serverInfo": {"name": "golf-store-bigquery-mcp", "version": "0.1.0"},
                "tools": [tool["name"] for tool in TOOLS],
            }
        )

    if request.method != "POST" or path != "/mcp":
        return _response({"error": "not_found", "path": path}, 404)

    payload = request.get_json(silent=True)
    if payload is None:
        return _response(_jsonrpc_error(None, -32700, "Invalid JSON"), 400)

    if isinstance(payload, list):
        responses = [_handle_jsonrpc(item) for item in payload]
        responses = [item for item in responses if item is not None]
        return _response(responses)

    response = _handle_jsonrpc(payload)
    if response is None:
        return "", 204, _headers()
    return _response(response)
