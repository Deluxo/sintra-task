"use client";

import {
  createContext,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./model";

const INITIAL_PRODUCT: Product = {
  name: "",
  description: "",
  price: 0,
  category: "",
};

interface ProductContextValue {
  product: Product;
  setProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export { ProductContext };

export function ProductProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCT);

  const value: ProductContextValue = { product, setProduct };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
