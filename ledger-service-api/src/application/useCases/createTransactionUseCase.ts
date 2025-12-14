import { Transaction } from "../../domain/entitites/Transaction";
import { TransactionRepository } from "../../infrastructure/repository/transactionRepository";
import { randomUUID } from "crypto";

interface CreateTransactionInput {
  date: Date;
  value: number;
  type: "debit" | "credit";
  originalDocumentId: string;
  createdBy: string;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly repository: TransactionRepository
  ) {}

  async execute(input: CreateTransactionInput): Promise<void> {
    const existing =
      await this.repository.findByOriginalDocumentId(input.originalDocumentId);

    if (existing) {
      throw new Error("Transaction already exists");
    }

    const transaction = Transaction.create({id: randomUUID(), ...input});

    await this.repository.save(transaction);
  }
}
