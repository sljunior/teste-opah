export interface TransactionInactivatedEvent {
  transactionId: string;
  date: string;
  value: number;
  type: "debit" | "credit";
  group: "OPERATIONAL" | "FINANCIAL" | "INVESTMENT";
  category: string;
  originalDocumentId: string;
  createdBy: string;
  status: "active" | "inactive";
  inactivatedBy: string;
}
