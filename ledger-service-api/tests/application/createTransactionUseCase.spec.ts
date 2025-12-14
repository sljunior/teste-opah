import { describe, test, expect, beforeEach } from "@jest/globals";
import { CreateTransactionUseCase } from "../../src/application/useCases/createTransactionUseCase";
import { InMemoryTransactionRepository } from "../../src/infrastructure/repository/inMemoryTransactionRepository";
import { JsonEventPublisher } from "../../src/infrastructure/queue/jsonEventPublisher";
import { TransactionCreatedEvent } from "../../src/application/events/transactionCreatedEvent";
import { EventPublisher } from "../../src/application/ports/eventPublisher";


class FakeEventPublisher implements EventPublisher<TransactionCreatedEvent> {
  public events: TransactionCreatedEvent[] = [];

  async publish(event: TransactionCreatedEvent): Promise<void> {
    this.events.push(event);
  }
}

describe("Create Transaction UseCase", () => {
  let publisher = new FakeEventPublisher();
  let repository: InMemoryTransactionRepository;
  
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    repository = new InMemoryTransactionRepository();
    useCase = new CreateTransactionUseCase(repository, publisher);
  });

  test("should create a valid transaction", async () => {
    const input = {
      date: new Date(),
      value: 100,
      type: "credit" as const,
      originalDocumentId: "doc-123",
      createdBy: "user-1",
    };

    const transaction = await useCase.execute(input);

    expect(transaction.id).toBeDefined();
    expect(transaction.status).toBe("active");
    expect(transaction.value).toBe(100);
    expect(transaction.type).toBe("credit");
    expect(transaction.originalDocumentId).toBe("doc-123");
    expect(transaction.createdBy).toBe("user-1");
    expect(transaction.creationDate).toBeInstanceOf(Date);

    expect(publisher.events.length).toBe(1);
    expect(publisher.events[0].originalDocumentId).toBe("doc-123");
  });

  test("should not create a transaction if originalDocumentId already exists", async () => {
    const input = {
      date: new Date(),
      value: 100,
      type: "credit" as const,
      originalDocumentId: "doc-123",
      createdBy: "user-1",
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toThrow(
      "Transaction already exists"
    );
  });
});
