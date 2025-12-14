import { TransactionRepository } from "../../infrastructure/repository/transactionRepository";

interface InactivateTransactionInput {
  transactionId: string;
  userId: string;
}

export class InactivateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(input: InactivateTransactionInput): Promise<void> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId
    );

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    transaction.inactivate(input.userId);

    await this.transactionRepository.save(transaction);
  }
}
