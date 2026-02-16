export interface ReviewFormValues {
  productName: string;
  customerName: string;
  customerAvatar?: FileList | null;
  rating: number;
  comment: string;
  status: "approved" | "pending" | "rejected";
}
