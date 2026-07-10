import datetime
import decimal
import json
import os

from google.cloud import bigquery


PROJECT_ID = os.environ["BIGQUERY_PROJECT"]
DATASET_ID = os.environ["BIGQUERY_DATASET"]
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")

client = bigquery.Client(project=PROJECT_ID)


def _headers(content_type="application/json"):
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": content_type,
    }


def _response(body, status=200):
    return json.dumps(body, default=_json_default), status, _headers()


def _json_default(value):
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    return str(value)


def _row_to_dict(value):
    if isinstance(value, bigquery.table.Row):
        return {key: _row_to_dict(value[key]) for key in value.keys()}
    if isinstance(value, list):
        return [_row_to_dict(item) for item in value]
    if isinstance(value, tuple):
        return [_row_to_dict(item) for item in value]
    if isinstance(value, dict):
        return {key: _row_to_dict(item) for key, item in value.items()}
    return value


def _query(sql, parameters=None):
    job_config = bigquery.QueryJobConfig(query_parameters=parameters or [])
    return [_row_to_dict(row) for row in client.query(sql, job_config=job_config).result()]


def _table(name):
    return f"`{PROJECT_ID}.{DATASET_ID}.{name}`"


def _int_arg(request, name, default, minimum=1, maximum=100):
    raw = request.args.get(name, default)
    try:
        value = int(raw)
    except (TypeError, ValueError):
        value = default
    return max(minimum, min(maximum, value))


def _bool_arg(request, name):
    raw = request.args.get(name)
    if raw is None:
        return None
    return str(raw).strip().lower() in {"1", "true", "yes", "y", "on"}


def _skill_level_terms(raw):
    value = str(raw or "").strip().lower()
    if not value:
        return []
    terms = {value}
    if any(token in value for token in ["experienced", "advanced", "expert", "low handicap", "low-handicap", "skilled"]):
        terms.update(
            [
                "advanced",
                "expert",
                "skilled",
                "ball striker",
                "compact control",
                "forged feel",
                "low handicap",
                "0-8",
                "4-12",
                "5-15",
            ]
        )
    if any(token in value for token in ["beginner", "new golfer", "high handicap"]):
        terms.update(["beginner", "new golfer", "forgiving", "10-25", "12-30", "all handicaps"])
    if any(token in value for token in ["intermediate", "improving", "mid handicap", "mid-handicap"]):
        terms.update(["intermediate", "improving", "mid-handicap", "8-20", "10-25", "5-15"])
    return sorted(terms)


def _search_products(request):
    page_size_default = request.args.get("page_size") or request.args.get("limit") or 10
    page_size = _int_arg(request, "page_size", page_size_default, 1, 50)
    page = _int_arg(request, "page", 1, 1, 500)
    offset = (page - 1) * page_size
    q = request.args.get("q")
    category = request.args.get("category")
    category_id = request.args.get("category_id")
    category_slug = request.args.get("category_slug")
    brand = request.args.get("brand")
    skill_level = request.args.get("skill_level")
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")
    in_stock = _bool_arg(request, "in_stock")
    sort = (request.args.get("sort") or "relevance").lower()

    filters = []
    params = [
        bigquery.ScalarQueryParameter("page_size", "INT64", page_size),
        bigquery.ScalarQueryParameter("offset", "INT64", offset),
    ]

    if q:
        q_lower = q.lower()
        q_match = q_lower[:-1] if len(q_lower) > 3 and q_lower.endswith("s") else q_lower
        filters.append(
            """
            (
              LOWER(product_name) LIKE @q_like
              OR LOWER(product_name) LIKE @q_match_like
              OR LOWER(category_name) LIKE @q_like
              OR LOWER(category_name) LIKE @q_match_like
              OR LOWER(category_slug) LIKE @q_like
              OR LOWER(category_slug) LIKE @q_match_like
              OR LOWER(parent_category) LIKE @q_like
              OR LOWER(parent_category) LIKE @q_match_like
              OR LOWER(short_description) LIKE @q_like
              OR LOWER(short_description) LIKE @q_match_like
              OR LOWER(long_description) LIKE @q_like
              OR LOWER(long_description) LIKE @q_match_like
              OR EXISTS (
                SELECT 1
                FROM UNNEST(tags) AS tag
                WHERE LOWER(tag) LIKE @q_like OR LOWER(tag) LIKE @q_match_like
              )
            )
            """
        )
        params.append(bigquery.ScalarQueryParameter("q_lower", "STRING", q_lower))
        params.append(bigquery.ScalarQueryParameter("q_match", "STRING", q_match))
        params.append(bigquery.ScalarQueryParameter("q_like", "STRING", f"%{q_lower}%"))
        params.append(bigquery.ScalarQueryParameter("q_match_like", "STRING", f"%{q_match}%"))

    relevance_sql = """
        MAX(
          CASE
            WHEN @q_lower IS NULL THEN 0
            WHEN LOWER(category_name) IN (@q_lower, @q_match) OR LOWER(category_slug) IN (@q_lower, @q_match) OR LOWER(parent_category) IN (@q_lower, @q_match) THEN 100
            WHEN LOWER(category_name) LIKE @q_like OR LOWER(category_name) LIKE @q_match_like OR LOWER(category_slug) LIKE @q_like OR LOWER(category_slug) LIKE @q_match_like OR LOWER(parent_category) LIKE @q_like OR LOWER(parent_category) LIKE @q_match_like THEN 95
            WHEN LOWER(product_name) LIKE @q_like OR LOWER(product_name) LIKE @q_match_like THEN 90
            WHEN EXISTS (
              SELECT 1
              FROM UNNEST(tags) AS tag
              WHERE LOWER(tag) IN (@q_lower, @q_match)
            ) THEN 80
            WHEN EXISTS (
              SELECT 1
              FROM UNNEST(tags) AS tag
              WHERE LOWER(tag) LIKE @q_like OR LOWER(tag) LIKE @q_match_like
            ) THEN 70
            WHEN LOWER(short_description) LIKE @q_like OR LOWER(short_description) LIKE @q_match_like THEN 60
            WHEN LOWER(long_description) LIKE @q_like OR LOWER(long_description) LIKE @q_match_like THEN 30
            ELSE 0
          END
        ) AS relevance_score,
    """ if q else "0 AS relevance_score,"

    if category:
        filters.append("(LOWER(category_name) = @category OR LOWER(parent_category) = @category)")
        params.append(bigquery.ScalarQueryParameter("category", "STRING", category.lower()))

    if category_id:
        filters.append("LOWER(category_id) = @category_id")
        params.append(bigquery.ScalarQueryParameter("category_id", "STRING", category_id.lower()))

    if category_slug:
        filters.append("LOWER(category_slug) = @category_slug")
        params.append(bigquery.ScalarQueryParameter("category_slug", "STRING", category_slug.lower()))

    if brand:
        filters.append("LOWER(brand_name) = @brand")
        params.append(bigquery.ScalarQueryParameter("brand", "STRING", brand.lower()))

    if skill_level:
        filters.append(
            """
            EXISTS (
              SELECT 1
              FROM UNNEST(@skill_level_terms) AS skill_level_term
              WHERE LOWER(target_player_profile) LIKE CONCAT('%', skill_level_term, '%')
                OR LOWER(handicap_range) LIKE CONCAT('%', skill_level_term, '%')
                OR EXISTS (
                  SELECT 1
                  FROM UNNEST(tags) AS tag
                  WHERE LOWER(tag) LIKE CONCAT('%', skill_level_term, '%')
                )
            )
            """
        )
        params.append(bigquery.ArrayQueryParameter("skill_level_terms", "STRING", _skill_level_terms(skill_level)))

    if min_price:
        try:
            min_price_value = float(min_price)
        except ValueError:
            return {"error": "min_price must be numeric"}, 400
        filters.append("CAST(min_current_sale_price AS FLOAT64) >= @min_price")
        params.append(bigquery.ScalarQueryParameter("min_price", "FLOAT64", min_price_value))

    if max_price:
        try:
            max_price_value = float(max_price)
        except ValueError:
            return {"error": "max_price must be numeric"}, 400
        filters.append("CAST(min_current_sale_price AS FLOAT64) <= @max_price")
        params.append(bigquery.ScalarQueryParameter("max_price", "FLOAT64", max_price_value))

    if in_stock is True:
        filters.append("total_stock_quantity > 0")

    order_sql = {
        "price_asc": "min_current_sale_price ASC, product_name",
        "price_desc": "min_current_sale_price DESC, product_name",
        "rating": "average_rating DESC, review_count DESC, product_name",
        "newest": "model_year DESC, release_season DESC, product_name",
        "popular": "units_sold_90d DESC, review_count DESC, product_name",
        "relevance": "relevance_score DESC, average_rating DESC, product_name",
    }.get(sort, "relevance_score DESC, average_rating DESC, product_name")

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
      SELECT
        *,
        {relevance_sql}
        COUNT(*) OVER() AS total_count
      FROM {_table("vw_product_listing_current")}
      {where_sql}
      ORDER BY {order_sql}
      LIMIT @page_size OFFSET @offset
    """

    rows = _query(sql, params)
    total_count = rows[0].get("total_count", 0) if rows else 0
    for row in rows:
        row.pop("total_count", None)
    return {"products": rows, "count": len(rows), "total_count": total_count, "page": page, "page_size": page_size}, 200


def _product_details(product_id):
    sql = f"""
      SELECT *
      FROM {_table("vw_product_detail_current")}
      WHERE product_id = @product_id
      LIMIT 1
    """
    rows = _query(sql, [bigquery.ScalarQueryParameter("product_id", "STRING", product_id)])
    if not rows:
        return {"error": "product_not_found", "product_id": product_id}, 404
    product = rows[0]
    return {"product_id": product_id, "product": product, "variants": product.get("variants", [])}, 200


def _compare_products(request):
    payload = request.get_json(silent=True) or {}
    product_ids = payload.get("product_ids")
    if not isinstance(product_ids, list) or not product_ids:
        return {"error": "product_ids must be a non-empty array"}, 400

    sql = f"""
      SELECT
        product_id,
        ANY_VALUE(product_name) AS product_name,
        ANY_VALUE(brand_name) AS brand_name,
        ANY_VALUE(category_name) AS category_name,
        ANY_VALUE(target_player_profile) AS target_player_profile,
        ANY_VALUE(handicap_range) AS handicap_range,
        MIN(current_sale_price) AS min_current_sale_price,
        MAX(current_sale_price) AS max_current_sale_price,
        SUM(IFNULL(stock_quantity, 0)) AS total_stock_quantity,
        ROUND(AVG(average_rating), 2) AS average_rating,
        MAX(review_count) AS review_count,
        ANY_VALUE(short_description) AS short_description,
        ANY_VALUE(image_url) AS image_url,
        ANY_VALUE(image_alt) AS image_alt,
        ARRAY_AGG(DISTINCT image_url IGNORE NULLS LIMIT 3) AS image_uris,
        ANY_VALUE(sample_positive_review) AS sample_positive_review,
        ANY_VALUE(sample_negative_review) AS sample_negative_review
      FROM {_table("vw_product_catalog_current")}
      WHERE product_id IN UNNEST(@product_ids)
      GROUP BY product_id
      ORDER BY product_name
    """
    rows = _query(
        sql,
        [bigquery.ArrayQueryParameter("product_ids", "STRING", [str(item) for item in product_ids])],
    )
    found_ids = {row["product_id"] for row in rows}
    missing_ids = [item for item in product_ids if item not in found_ids]
    return {"products": rows, "missing_product_ids": missing_ids}, 200


def _facets():
    sql = f"""
      SELECT *
      FROM {_table("vw_product_facets")}
      ORDER BY facet_type, facet_label
    """
    rows = _query(sql)
    return {
        "facets": rows,
        "categories": [row for row in rows if row.get("facet_type") == "category"],
        "brands": [row for row in rows if row.get("facet_type") == "brand"],
        "player_profiles": [row for row in rows if row.get("facet_type") == "player_profile"],
        "stock": [row for row in rows if row.get("facet_type") == "stock"],
        "price": next((row for row in rows if row.get("facet_type") == "price"), None),
        "count": len(rows),
    }, 200


def _categories():
    sql = f"""
      SELECT
        nav.*,
        margin.variant_count,
        margin.avg_current_sale_price,
        margin.avg_margin_percent,
        margin.units_sold_30d,
        margin.units_sold_90d,
        margin.net_revenue_90d,
        margin.avg_return_rate
      FROM {_table("vw_category_navigation")} AS nav
      LEFT JOIN {_table("vw_category_margin_summary")} AS margin
        ON nav.category_id = margin.category_id
      ORDER BY nav.category_name
    """
    rows = _query(sql)
    return {"categories": rows, "count": len(rows)}, 200


def _cart_estimate(request):
    payload = request.get_json(silent=True) or {}
    raw_items = payload.get("items")
    if not isinstance(raw_items, list) or not raw_items:
        return {"error": "items must be a non-empty array"}, 400

    requested_items = []
    invalid_items = []
    for index, raw_item in enumerate(raw_items):
        if not isinstance(raw_item, dict):
            invalid_items.append({"index": index, "reason": "item must be an object"})
            continue
        variant_id = raw_item.get("variant_id") or raw_item.get("variantId")
        product_id = raw_item.get("product_id") or raw_item.get("productId")
        try:
            quantity = int(raw_item.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        if not variant_id:
            invalid_items.append({"index": index, "product_id": product_id, "reason": "variant_id is required"})
            continue
        requested_items.append({
            "product_id": str(product_id) if product_id is not None else None,
            "variant_id": str(variant_id),
            "quantity": max(1, min(99, quantity)),
        })

    if not requested_items:
        return {"lines": [], "unavailable_items": invalid_items, "subtotal": 0, "rewards_points_estimate": 0}, 200

    rows = _query(
        f"""
          SELECT *
          FROM {_table("vw_cart_pricing_current")}
          WHERE variant_id IN UNNEST(@variant_ids)
        """,
        [bigquery.ArrayQueryParameter("variant_ids", "STRING", [item["variant_id"] for item in requested_items])],
    )
    rows_by_variant = {row["variant_id"]: row for row in rows}
    lines = []
    unavailable_items = list(invalid_items)
    subtotal = 0.0

    for item in requested_items:
        row = rows_by_variant.get(item["variant_id"])
        if not row:
            unavailable_items.append({**item, "reason": "variant_not_found"})
            continue
        unit_price = float(row.get("current_sale_price") or 0)
        stock_quantity = int(row.get("stock_quantity") or 0)
        is_available = bool(row.get("is_purchasable")) and stock_quantity >= item["quantity"]
        line_subtotal = round(unit_price * item["quantity"], 2) if is_available else 0
        if is_available:
            subtotal += line_subtotal
        else:
            unavailable_items.append({**item, "reason": "insufficient_stock" if row.get("is_purchasable") else "not_purchasable", "stock_quantity": stock_quantity})
        lines.append({
            "product_id": row.get("product_id"),
            "variant_id": row.get("variant_id"),
            "sku": row.get("sku"),
            "product_name": row.get("product_name"),
            "brand_name": row.get("brand_name"),
            "category_id": row.get("category_id"),
            "category_slug": row.get("category_slug"),
            "category_name": row.get("category_name"),
            "image_url": row.get("image_url"),
            "image_alt": row.get("image_alt"),
            "quantity": item["quantity"],
            "unit_price": unit_price,
            "line_subtotal": line_subtotal,
            "stock_quantity": stock_quantity,
            "inventory_status": row.get("inventory_status"),
            "is_available": is_available,
            "options": {
                "handedness": row.get("handedness"),
                "color": row.get("color"),
                "size": row.get("size"),
                "loft": row.get("loft"),
                "shaft_flex": row.get("shaft_flex"),
                "ball_color": row.get("ball_color"),
                "pack_size": row.get("pack_size"),
                "shoe_size": row.get("shoe_size"),
                "shoe_width": row.get("shoe_width"),
                "apparel_fit": row.get("apparel_fit"),
            },
        })

    subtotal = round(subtotal, 2)
    return {
        "lines": lines,
        "unavailable_items": unavailable_items,
        "subtotal": subtotal,
        "rewards_points_estimate": int(subtotal),
        "financing_hints": _cart_financing_hints(subtotal) if subtotal > 0 else [],
        "shipping_hints": _cart_shipping_hints(),
        "currency": "USD",
    }, 200


def _cart_financing_hints(amount):
    return _query(
        f"""
          SELECT *
          FROM {_table("vw_active_financing_options")}
          WHERE (min_purchase_amount IS NULL OR min_purchase_amount <= @amount)
            AND (max_purchase_amount IS NULL OR @amount <= max_purchase_amount)
          ORDER BY option_type, min_purchase_amount, offer_name
          LIMIT 3
        """,
        [bigquery.ScalarQueryParameter("amount", "FLOAT64", amount)],
    )


def _cart_shipping_hints():
    return _query(
        f"""
          SELECT *
          FROM {_table("vw_purchase_support_policies")}
          WHERE policy_type = 'SHIPPING'
          ORDER BY base_fee, estimated_max_business_days
          LIMIT 3
        """
    )


def _low_stock(request):
    limit = _int_arg(request, "limit", 20, 1, 100)
    sql = f"""
      SELECT *
      FROM {_table("vw_low_stock_best_sellers")}
      ORDER BY units_sold_90d DESC, total_stock_quantity ASC
      LIMIT @limit
    """
    rows = _query(sql, [bigquery.ScalarQueryParameter("limit", "INT64", limit)])
    return {"products": rows, "count": len(rows)}, 200


def _amount_arg(request):
    raw = request.args.get("amount")
    if raw is None:
        return None, None
    try:
        return float(raw), None
    except ValueError:
        return None, {"error": "amount must be numeric"}


def _financing_options(request, option_type=None):
    amount, error = _amount_arg(request)
    if error:
        return error, 400

    filters = []
    params = []
    if option_type:
        filters.append("option_type = @option_type")
        params.append(bigquery.ScalarQueryParameter("option_type", "STRING", option_type))
    if amount is not None:
        filters.append(
            """
            (min_purchase_amount IS NULL OR min_purchase_amount <= @amount)
            AND (max_purchase_amount IS NULL OR @amount <= max_purchase_amount)
            """
        )
        params.append(bigquery.ScalarQueryParameter("amount", "FLOAT64", amount))

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
      SELECT *
      FROM {_table("vw_active_financing_options")}
      {where_sql}
      ORDER BY option_type, min_purchase_amount, offer_name
    """
    rows = _query(sql, params)
    return {"financing_options": rows, "count": len(rows)}, 200


def _loyalty_programs():
    sql = f"""
      SELECT *
      FROM {_table("vw_loyalty_benefits")}
      ORDER BY annual_spend_min, tier_name
    """
    rows = _query(sql)
    return {"loyalty_tiers": rows, "count": len(rows)}, 200


def _promotions(request):
    category = request.args.get("category")
    product_id = request.args.get("product_id")
    params = []
    filters = []

    if category:
        filters.append(
            """
            (
              LOWER(applies_to_category_id) = @category
              OR LOWER(category_name) = @category
              OR LOWER(parent_category) = @category
            )
            """
        )
        params.append(bigquery.ScalarQueryParameter("category", "STRING", category.lower()))
    if product_id:
        filters.append("(applies_to_product_id IS NULL OR applies_to_product_id = @product_id)")
        params.append(bigquery.ScalarQueryParameter("product_id", "STRING", product_id))

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
      SELECT *
      FROM {_table("vw_active_promotions")}
      {where_sql}
      ORDER BY end_date, promotion_name
    """
    rows = _query(sql, params)
    return {"promotions": rows, "count": len(rows)}, 200


def _policies(policy_type, request):
    category = request.args.get("category")
    filters = ["policy_type = @policy_type"]
    params = [bigquery.ScalarQueryParameter("policy_type", "STRING", policy_type)]

    if category and policy_type in {"RETURN", "WARRANTY"}:
        filters.append(
            """
            (
              category_id IS NULL
              OR LOWER(category_id) = @category
              OR LOWER(category_name) = @category
            )
            """
        )
        params.append(bigquery.ScalarQueryParameter("category", "STRING", category.lower()))

    sql = f"""
      SELECT *
      FROM {_table("vw_purchase_support_policies")}
      WHERE {' AND '.join(filters)}
      ORDER BY category_id IS NULL DESC, category_name, policy_name
    """
    rows = _query(sql, params)
    return {"policies": rows, "count": len(rows)}, 200


def _checkout_guidance():
    sql = f"""
      SELECT *
      FROM {_table("vw_checkout_support")}
      ORDER BY step_order
    """
    rows = _query(sql)
    return {"checkout_steps": rows, "count": len(rows)}, 200


def _openapi(request):
    base_url = request.url_root.rstrip("/")
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Golf Store Product API",
            "version": "0.1.0",
        },
        "servers": [{"url": base_url}],
        "paths": {
            "/products": {
                "get": {
                    "operationId": "searchProducts",
                    "summary": "Search products",
                    "description": "Search BigQuery-backed golf products by keyword, category, brand, skill level, price range, stock status, and sort order.",
                    "parameters": [
                        {"name": "q", "in": "query", "schema": {"type": "string"}},
                        {"name": "category", "in": "query", "schema": {"type": "string"}},
                        {"name": "category_id", "in": "query", "schema": {"type": "string"}},
                        {"name": "category_slug", "in": "query", "schema": {"type": "string"}},
                        {"name": "brand", "in": "query", "schema": {"type": "string"}},
                        {"name": "skill_level", "in": "query", "schema": {"type": "string"}},
                        {"name": "min_price", "in": "query", "schema": {"type": "number"}},
                        {"name": "max_price", "in": "query", "schema": {"type": "number"}},
                        {"name": "in_stock", "in": "query", "schema": {"type": "boolean"}},
                        {
                            "name": "sort",
                            "in": "query",
                            "schema": {
                                "type": "string",
                                "enum": ["relevance", "price_asc", "price_desc", "rating", "newest", "popular"],
                            },
                        },
                        {"name": "page", "in": "query", "schema": {"type": "integer", "minimum": 1, "default": 1}},
                        {
                            "name": "page_size",
                            "in": "query",
                            "schema": {"type": "integer", "minimum": 1, "maximum": 50, "default": 10},
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "schema": {"type": "integer", "minimum": 1, "maximum": 50, "default": 10},
                        },
                    ],
                    "responses": {
                        "200": {
                            "description": "Matching products and pagination details.",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/ProductSearchResponse"}
                                }
                            },
                        }
                    },
                }
            },
            "/products/{product_id}": {
                "get": {
                    "operationId": "getProductDetails",
                    "summary": "Get product details",
                    "description": "Retrieve catalog, inventory, pricing, specs, tags, and review fields for a product ID.",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Product details.",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/ProductDetailResponse"}
                                }
                            },
                        },
                        "404": {
                            "description": "Product not found.",
                            "content": {
                                "application/json": {"schema": {"$ref": "#/components/schemas/ErrorResponse"}}
                            },
                        },
                    },
                }
            },
            "/compare": {"post": {"summary": "Compare products"}},
            "/categories": {"get": {"summary": "Category navigation and margin summary"}},
            "/facets": {"get": {"summary": "Product listing facets"}},
            "/cart/estimate": {"post": {"summary": "Estimate cart pricing, availability, rewards, financing, and shipping"}},
            "/low-stock": {"get": {"summary": "Low-stock best sellers"}},
            "/financing": {"get": {"summary": "Financing options"}},
            "/card-offers": {"get": {"summary": "Store and co-branded card offers"}},
            "/installment-plans": {"get": {"summary": "Installment financing plans"}},
            "/loyalty": {"get": {"summary": "Loyalty program benefits"}},
            "/promotions": {"get": {"summary": "Active promotions"}},
            "/shipping": {"get": {"summary": "Shipping services and policies"}},
            "/returns": {"get": {"summary": "Return policies"}},
            "/warranties": {"get": {"summary": "Warranty policies"}},
            "/checkout-guidance": {"get": {"summary": "Checkout guidance"}},
            "/health": {"get": {"summary": "Health check"}},
        },
        "components": {
            "schemas": {
                "ProductSummary": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string"},
                        "product_name": {"type": "string"},
                        "brand_name": {"type": "string"},
                        "category_name": {"type": "string"},
                        "current_sale_price": {"type": "number"},
                        "average_rating": {"type": "number"},
                        "review_count": {"type": "integer"},
                        "inventory_status": {"type": "string"},
                        "target_player_profile": {"type": "string"},
                        "short_description": {"type": "string"},
                    },
                },
                "ProductSearchResponse": {
                    "type": "object",
                    "properties": {
                        "products": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/ProductSummary"},
                        },
                        "count": {"type": "integer"},
                        "total_count": {"type": "integer"},
                        "page": {"type": "integer"},
                        "page_size": {"type": "integer"},
                    },
                },
                "ProductDetailResponse": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string"},
                        "product": {"type": "object", "additionalProperties": True},
                        "variants": {
                            "type": "array",
                            "items": {"type": "object", "additionalProperties": True},
                        },
                    },
                },
                "ErrorResponse": {
                    "type": "object",
                    "properties": {
                        "error": {"type": "string"},
                        "message": {"type": "string"},
                    },
                },
            }
        },
    }, 200


def handle_request(request):
    if request.method == "OPTIONS":
        return "", 204, _headers()

    path = request.path.rstrip("/") or "/"
    try:
        if path in {"/", "/health"}:
            return _response({"status": "ok", "dataset": f"{PROJECT_ID}.{DATASET_ID}"})
        if path == "/openapi.json":
            body, status = _openapi(request)
            return _response(body, status)
        if path == "/products" and request.method == "GET":
            body, status = _search_products(request)
            return _response(body, status)
        if path.startswith("/products/") and request.method == "GET":
            product_id = path.split("/", 2)[2]
            body, status = _product_details(product_id)
            return _response(body, status)
        if path == "/compare" and request.method == "POST":
            body, status = _compare_products(request)
            return _response(body, status)
        if path == "/categories" and request.method == "GET":
            body, status = _categories()
            return _response(body, status)
        if path == "/facets" and request.method == "GET":
            body, status = _facets()
            return _response(body, status)
        if path == "/cart/estimate" and request.method == "POST":
            body, status = _cart_estimate(request)
            return _response(body, status)
        if path == "/low-stock" and request.method == "GET":
            body, status = _low_stock(request)
            return _response(body, status)
        if path == "/financing" and request.method == "GET":
            body, status = _financing_options(request)
            return _response(body, status)
        if path == "/card-offers" and request.method == "GET":
            body, status = _financing_options(request, "CARD")
            return _response(body, status)
        if path == "/installment-plans" and request.method == "GET":
            body, status = _financing_options(request, "INSTALLMENT")
            return _response(body, status)
        if path == "/loyalty" and request.method == "GET":
            body, status = _loyalty_programs()
            return _response(body, status)
        if path == "/promotions" and request.method == "GET":
            body, status = _promotions(request)
            return _response(body, status)
        if path == "/shipping" and request.method == "GET":
            body, status = _policies("SHIPPING", request)
            return _response(body, status)
        if path == "/returns" and request.method == "GET":
            body, status = _policies("RETURN", request)
            return _response(body, status)
        if path == "/warranties" and request.method == "GET":
            body, status = _policies("WARRANTY", request)
            return _response(body, status)
        if path == "/checkout-guidance" and request.method == "GET":
            body, status = _checkout_guidance()
            return _response(body, status)
        return _response({"error": "not_found", "path": path}, 404)
    except Exception as exc:
        return _response({"error": "internal_error", "message": str(exc)}, 500)
