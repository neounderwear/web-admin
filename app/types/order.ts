import type { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending_payment" | "payment_verified" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type PaymentMethod = "midtrans" | "manual_transfer" | "cash";

export interface OrderItem {
  productId: string;
  variantSku?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  thumbnailUrl: string;
  weight: number;
}

export interface ShippingInfo {
  courier: string;
  service: string;
  description?: string;
  cost: number;
  weightTotal: number;
  trackingNumber?: string;
  shippedAt?: Date;
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  cityId: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: "unpaid" | "paid" | "failed" | "expired";
  totalAmount: number;
  manualTransferProof?: string;
  snapToken?: string;
  transactionId?: string;
  paymentType?: string;
  paidAt?: Date;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  status: OrderStatus;
  notes?: string;
  source: "manual" | "web";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument extends Omit<Order, "id" | "createdAt" | "updatedAt" | "shipping" | "payment"> {
  shipping: Omit<ShippingInfo, "shippedAt"> & { shippedAt?: Timestamp };
  payment: Omit<PaymentInfo, "paidAt"> & { paidAt?: Timestamp };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
