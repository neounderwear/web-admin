import type { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  nameLowerCase: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument {
  name: string;
  nameLowerCase: string;
  description: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
