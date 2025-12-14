import { Transaction } from "../../domain/entitites/Transaction";
import { TransactionRepository } from "../../infrastructure/repository/transactionRepository";
import { TransactionInactivatedEvent } from "../events/transactionInactivatedEvent";
import { EventPublisher } from "../ports/eventPublisher";

interface InactivateTransactionInput {
  transactionId: string;
  userId: string;
}

export class InactivateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly eventPublisher: EventPublisher<TransactionInactivatedEvent>
  ) {}

  async execute(input: InactivateTransactionInput): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId
    );

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }
    await this.transactionRepository.save(transaction)
    transaction.inactivate(input.userId);
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
  }
}
