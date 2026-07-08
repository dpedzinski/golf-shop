import { ProductListingPage } from "../../components/ecommerce";
import { getStorefrontConfig } from "../../storefront-config";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <ProductListingPage config={getStorefrontConfig()} lockedCategorySlug={params.slug} />;
}
