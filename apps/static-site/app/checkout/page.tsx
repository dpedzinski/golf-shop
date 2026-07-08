import { CheckoutPage } from "../components/ecommerce";
import { getStorefrontConfig } from "../storefront-config";

export default function CheckoutRoute() {
  return <CheckoutPage config={getStorefrontConfig()} />;
}
