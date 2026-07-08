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


def _search_products(request):
    limit = _int_arg(request, "limit", 10, 1, 50)
    q = request.args.get("q")
    category = request.args.get("category")
    brand = request.args.get("brand")
    skill_level = request.args.get("skill_level")
    max_price = request.args.get("max_price")

    filters = []
    params = [bigquery.ScalarQueryParameter("limit", "INT64", limit)]

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
            WHEN LOWER(category_name) IN (@q_lower, @q_match) OR LOWER(parent_category) IN (@q_lower, @q_match) THEN 100
            WHEN LOWER(category_name) LIKE @q_like OR LOWER(category_name) LIKE @q_match_like OR LOWER(parent_category) LIKE @q_like OR LOWER(parent_category) LIKE @q_match_like THEN 95
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

    if brand:
        filters.append("LOWER(brand_name) = @brand")
        params.append(bigquery.ScalarQueryParameter("brand", "STRING", brand.lower()))

    if skill_level:
        filters.append(
            "(LOWER(target_player_profile) LIKE @skill_level OR LOWER(handicap_range) LIKE @skill_level)"
        )
        params.append(bigquery.ScalarQueryParameter("skill_level", "STRING", f"%{skill_level.lower()}%"))

    if max_price:
        try:
            max_price_value = float(max_price)
        except ValueError:
            return {"error": "max_price must be numeric"}, 400
        filters.append("CAST(current_sale_price AS FLOAT64) <= @max_price")
        params.append(bigquery.ScalarQueryParameter("max_price", "FLOAT64", max_price_value))

    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    sql = f"""
      SELECT
        product_id,
        ANY_VALUE(product_name) AS product_name,
        ANY_VALUE(brand_name) AS brand_name,
        ANY_VALUE(category_name) AS category_name,
        ANY_VALUE(parent_category) AS parent_category,
        ANY_VALUE(target_player_profile) AS target_player_profile,
        ANY_VALUE(handicap_range) AS handicap_range,
        MIN(current_sale_price) AS min_current_sale_price,
        MAX(current_sale_price) AS max_current_sale_price,
        SUM(IFNULL(stock_quantity, 0)) AS total_stock_quantity,
        ROUND(AVG(average_rating), 2) AS average_rating,
        MAX(review_count) AS review_count,
        {relevance_sql}
        ANY_VALUE(short_description) AS short_description,
        ANY_VALUE(image_url) AS image_url,
        ANY_VALUE(image_alt) AS image_alt,
        ARRAY_AGG(DISTINCT image_url IGNORE NULLS LIMIT 3) AS image_uris,
        ARRAY_AGG(
          STRUCT(
            variant_id,
            sku,
            color,
            size,
            handedness,
            shaft_flex,
            current_sale_price,
            stock_quantity,
            inventory_status
          )
          ORDER BY current_sale_price
          LIMIT 5
        ) AS variants
      FROM {_table("vw_product_catalog_current")}
      {where_sql}
      GROUP BY product_id
      ORDER BY relevance_score DESC, average_rating DESC, product_name
      LIMIT @limit
    """

    rows = _query(sql, params)
    return {"products": rows, "count": len(rows)}, 200


def _product_details(product_id):
    sql = f"""
      SELECT *
      FROM {_table("vw_product_catalog_current")}
      WHERE product_id = @product_id
      ORDER BY current_sale_price, variant_id
      LIMIT 100
    """
    rows = _query(sql, [bigquery.ScalarQueryParameter("product_id", "STRING", product_id)])
    if not rows:
        return {"error": "product_not_found", "product_id": product_id}, 404
    return {"product_id": product_id, "variants": rows}, 200


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


def _categories():
    sql = f"""
      SELECT *
      FROM {_table("vw_category_margin_summary")}
      ORDER BY category_name
    """
    return {"categories": _query(sql)}, 200


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
            "/products": {"get": {"summary": "Search products"}},
            "/products/{product_id}": {"get": {"summary": "Get product details"}},
            "/compare": {"post": {"summary": "Compare products"}},
            "/categories": {"get": {"summary": "Category margin summary"}},
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
