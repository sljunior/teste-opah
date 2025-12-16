import { CashflowGroup, CashflowType } from "../../domain/entities/dailyCashflow";

interface TransactionEventBase {
  transactionId: string;
  date: string;
  value: number;
  type: CashflowType;
  group: CashflowGroup;
  category: string;
  originalDocumentId: string;
  createdBy: string;
  status: "active" | "inactive";
}

export interface TransactionCreatedEventPayload extends TransactionEventBase {
  status: "active";
}

export interface TransactionInactivatedEventPayload
  extends TransactionEventBase {
  status: "inactive";
  inactivatedBy: string;
}

export type LedgerTransactionEventPayload =
  | TransactionCreatedEventPayload
  | TransactionInactivatedEventPayload;

export type TransactionEvent =
  | {
      eventType: "TRANSACTION_CREATED";
      payload: TransactionCreatedEventPayload;
    }
  | {
      eventType: "TRANSACTION_INACTIVATED";
      payload: TransactionInactivatedEventPayload;
    };
