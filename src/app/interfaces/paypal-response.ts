export interface IPayPalResponse {
  transactionId: string;
  status: string;
  amount: string;
  currency: string;
}