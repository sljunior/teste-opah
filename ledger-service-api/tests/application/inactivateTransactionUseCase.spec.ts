import { describe, test, expect, beforeEach } from "@jest/globals";
import { InactivateTransactionUseCase } from "../../src/application/useCases/inactivateTransactionUseCase";
import { InMemoryTransactionRepository } from "../../src/infrastructure/repository/inMemoryTransactionRepository";
import { Transaction } from "../../src/domain/entitites/Transaction";
import { TransactionInactivatedEvent } from "../../src/application/events/transactionInactivatedEvent";
import { EventPublisher } from "../../src/application/ports/eventPublisher";

class FakeEventPublisher implements EventPublisher<TransactionInactivatedEvent> {
  public events: TransactionInactivatedEvent[] = [];

  async publish(event: TransactionInactivatedEvent): Promise<void> {
    this.events.push(event);
  }
}

describe("InactivateTransactionUseCase", () => {
  let publisher = new FakeEventPublisher();
  let repository: InMemoryTransactionRepository;
  let useCase: InactivateTransactionUseCase;

  beforeEach(() => {
    repository = new InMemoryTransactionRepository();
    publisher = new FakeEventPublisher();
    useCase = new InactivateTransactionUseCase(repository, publisher);
  });

  const createAndSaveTransaction = async () => {
    const transaction = Transaction.create({
      id: "tx-1",
      date: new Date(),
      value: 100,
      type: "credit",
      originalDocumentId: "doc-123",
      createdBy: "user-1",
    });

    await repository.save(transaction);
    return transaction;
  };

  test("should inactivate a transaction successfully", async () => {
    const transaction = await createAndSaveTransaction();
    const input = { transactionId: transaction.id, userId: "user-2" };
    await useCase.execute(input);

    const updated = await repository.findById(transaction.id);

    expect(updated).toBeDefined();
    expect(updated?.status).toBe("inactive");
    expect(updated?.inactivatedBy).toBe("user-2");
    expect(updated?.inactivationDate).toBeInstanceOf(Date);

    expect(publisher.events.length).toBe(1);
    expect(publisher.events[0].originalDocumentId).toBe("doc-123");
  });

  test("should throw error if transaction does not exist", async () => {
    const input = { transactionId: "invalid-id", userId: "user-2" };
    
    await expect(useCase.execute(input)).rejects.toThrow(
      "Transação não encontrada"
    );
    expect(publisher.events.length).toBe(0);
  });

  test("should not inactivate transaction without user", async () => {
    const transaction = await createAndSaveTransaction();
    const input = { transactionId: transaction.id, userId: "" };
    await expect(useCase.execute(input)).rejects.toThrow(
      "Ao excluir uma transação, o usuário de exclusão deve ser informado"
    );
    expect(publisher.events.length).toBe(0);
  });

  test("should not inactivate an already inactive transaction", async () => {
    const transaction = await createAndSaveTransaction();
    const input = { transactionId: transaction.id, userId: "user-2" };
    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toThrow(
      "Transação já foi inativada"
    );
    expect(publisher.events.length).toBe(1);
  });
});
