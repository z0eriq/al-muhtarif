export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type MetaCustomData = {
  currency?: string;
  value?: number;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  order_id?: string;
};
