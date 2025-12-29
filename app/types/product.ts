import type { Timestamp } from "firebase/firestore";

export interface ProductBase {
  brandId: string;
  categoryId: string;
  name: string;
  description: string;
  images: string[];
  wholesalePrice: number;
  resellerPrice: number;
  retailPrice: number; // Harga marketplace
  discountPrice: number; // Harga retail atau jual toko
  status: boolean;
  variants: ProductVariant[];
  videoUrl?: string | null;
  slug: string;
  nameLowerCase: string;
  brandName: string;
  categoryName: string;
  tags: string[];
  searchKeywords: string[];
  soldCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  thumbnailUrl: string;
  imageAltTexts: string[];
  discountPercent: number | null;
  totalStock: number;
  outOfStock: boolean;
  visibility: "public" | "hidden" | "draft";
  metaTitle: string;
  metaDescription: string;
  weight: number | null;
  material: string | null;
  dimensions: ProductDimensions | null;
  minOrder: number | null;
  isLimitedEdition: boolean;
  views: number;
}

export interface ProductVariantValue {
  sku: string;
  stock: number;
  value: string;
}

export interface ProductVariant {
  type: string;
  typeLowerCase: string;
  values: ProductVariantValue[];
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductDocument extends Omit<ProductBase, "discountStart" | "discountEnd"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  discountStart?: Timestamp | null;
  discountEnd?: Timestamp | null;
}

export interface Product extends Omit<ProductBase, "discountStart" | "discountEnd"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  discountStart?: Date | null;
  discountEnd?: Date | null;
}
