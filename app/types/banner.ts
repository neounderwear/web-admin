import type { Timestamp } from "firebase/firestore";

export interface Banner {
  id: string;
  name: string;
  nameLowerCase: string;
  photoUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerDocument {
  name: string;
  nameLowerCase: string;
  photoUrl: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
