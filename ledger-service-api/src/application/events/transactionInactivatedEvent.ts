export interface TransactionInactivatedEvent {
  transactionId: string;
  date: string;
  value: number;
  type: "debit" | "credit";
  originalDocumentId: string;
  createdBy: string;
  status: "active" | "inactive";
}