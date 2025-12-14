import { Transaction } from "../../domain/entitites/Transaction";

export abstract class TransactionRepository {
  abstract save(transaction: Transaction): Promise<void>;
  abstract findById(id: string): Promise<Transaction | undefined>;
  abstract findByOriginalDocumentId(
    originalDocumentId: string
  ): Promise<Transaction | undefined>;
}
