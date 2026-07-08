import { ProductListingPage } from "../components/ecommerce";
import { getStorefrontConfig } from "../storefront-config";

export default function ShopPage() {
  return <ProductListingPage config={getStorefrontConfig()} />;
}
