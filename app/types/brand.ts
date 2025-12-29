import { Timestamp } from "firebase/firestore";

export interface Brand {
  id: string;
  name: string;
  nameLowerCase: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandDocument {
  name: string;
  nameLowerCase: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
