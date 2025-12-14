import { Transaction } from "../../domain/entitites/Transaction";
import { TransactionRepository } from "./transactionRepository";

export class InMemoryTransactionRepository extends TransactionRepository {
  private transactions: Transaction[] = [];

  async save(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async findById(id: string): Promise<Transaction | undefined> {
    return this.transactions.find(t => t.id === id);
  }

  async findByOriginalDocumentId(
    originalDocumentId: string
  ): Promise<Transaction | undefined> {
    return this.transactions.find(
      t => t.originalDocumentId === originalDocumentId
    );
  }
}
