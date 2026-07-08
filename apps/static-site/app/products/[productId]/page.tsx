import { ProductDetailPage } from "../../components/ecommerce";
import { getStorefrontConfig } from "../../storefront-config";

export default function ProductPage({ params }: { params: { productId: string } }) {
  return <ProductDetailPage config={getStorefrontConfig()} productIdValue={params.productId} />;
}
