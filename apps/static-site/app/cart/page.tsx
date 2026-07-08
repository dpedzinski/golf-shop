import { CartPage } from "../components/ecommerce";
import { getStorefrontConfig } from "../storefront-config";

export default function CartRoute() {
  return <CartPage config={getStorefrontConfig()} />;
}
