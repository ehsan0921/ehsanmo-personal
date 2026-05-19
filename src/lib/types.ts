import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  title?: string;
  description?: string;
  type?: "download" | "webapp";
  url?: string;
  fileUrl?: string;
  fileName?: string;
  buttonLabel?: string;
  isActive?: boolean;
  downloadCount?: number;
  currentVersion?: {
    fileUrl?: string;
    fileName?: string;
    version?: string;
  };
  createdAt?: Timestamp;
};
