import { ComparePage } from "../components/ecommerce";
import { getStorefrontConfig } from "../storefront-config";

export default function CompareRoute() {
  return <ComparePage config={getStorefrontConfig()} />;
}
