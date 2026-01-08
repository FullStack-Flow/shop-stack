export interface TaxFormValues {
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
}