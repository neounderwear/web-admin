import type { Timestamp } from "firebase/firestore";

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  profilePicture?: string;
  addresses: CustomerAddress[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  source: "manual" | "web";
}

export interface CustomerDocument extends Omit<Customer, "id" | "createdAt" | "updatedAt" | "lastLoginAt"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
