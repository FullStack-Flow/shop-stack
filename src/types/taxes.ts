export interface Taxes {
  id: string;
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
}

export interface TaxFormValues {
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
}
