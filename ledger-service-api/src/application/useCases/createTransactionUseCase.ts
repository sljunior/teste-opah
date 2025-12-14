import { Transaction } from "../../domain/entitites/Transaction";
import { TransactionRepository } from "../../infrastructure/repository/transactionRepository";
import { TransactionCreatedEvent } from "../events/transactionCreatedEvent";
import { EventPublisher } from "../ports/eventPublisher";
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
    private readonly repository: TransactionRepository,
    private readonly eventPublisher: EventPublisher<TransactionCreatedEvent>
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const existing = await this.repository.findByOriginalDocumentId(
      input.originalDocumentId
    );

    if (existing) {
      throw new Error("Transaction already exists");
    }

    try {
      const transaction = Transaction.create({ id: randomUUID(), ...input });
      await this.repository.save(transaction);
      await this.eventPublisher.publish({
        transactionId: transaction.id,
        date: transaction.date.toISOString(),
        value: transaction.value,
        type: transaction.type,
        originalDocumentId: transaction.originalDocumentId,
        createdBy: transaction.createdBy,
        status: transaction.status
      });

      return transaction;
    } catch (err) {
      throw err;
    }
  }
}
