import { Product } from "src/cart";

export function productFactory(product?: Partial<Product>): Product {
  const factory: Product = {
    id: product?.id || (Date.now() + Math.ceil(Math.random() * 100)).toString(),
    name:
      product?.name || `Product ${Date.now() + Math.ceil(Math.random() * 100)}`,
    quantity: product?.quantity || Math.ceil(Math.random() * 100),
    price: product?.price || Math.ceil(Math.random() * 100),
  };
  return factory;
}
