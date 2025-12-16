import { ProcessTransactionEventUseCase } from "../../src/application/useCases/processTransactionEventUseCase";
import { DailyCashflowRepository } from "../../src/application/ports/dailyCashflowRepository";
import { DailyCashflow } from "../../src/domain/entities/dailyCashflow";
import {
  TransactionCreatedEventPayload,
  TransactionEvent,
  TransactionInactivatedEventPayload,
} from "../../src/application/events/transactionEvent";

class InMemoryDailyCashflowRepository implements DailyCashflowRepository {
  constructor(private store: DailyCashflow[] = []) {}

  async findAll(): Promise<DailyCashflow[]> {
    return this.store.map(snapshot =>
      DailyCashflow.fromSnapshot(snapshot.toSnapshot())
    );
  }

  async saveAll(cashflows: DailyCashflow[]): Promise<void> {
    this.store = cashflows.map(cf =>
      DailyCashflow.fromSnapshot(cf.toSnapshot())
    );
  }
}

describe("ProcessTransactionEventUseCase", () => {
  const makePayload = (
    partial?: Partial<TransactionCreatedEventPayload>
  ): TransactionCreatedEventPayload => ({
    transactionId: "tx-1",
    date: "2024-09-01T10:00:00Z",
    value: 100,
    type: "credit",
    group: "OPERATIONAL",
    category: "Receita",
    originalDocumentId: "doc-1",
    createdBy: "user-1",
    status: "active",
    ...partial,
  });

  it("should apply transactions and update balances sequentially", async () => {
    const repository = new InMemoryDailyCashflowRepository();
    const useCase = new ProcessTransactionEventUseCase(repository);

    await useCase.execute({
      eventType: "TRANSACTION_CREATED",
      payload: makePayload({ value: 200 }),
    });

    await useCase.execute({
      eventType: "TRANSACTION_CREATED",
      payload: makePayload({
        date: "2024-09-02T08:00:00Z",
        value: 50,
        type: "debit",
        category: "Despesa",
      }),
    });

    const cashflows = await repository.findAll();
    expect(cashflows).toHaveLength(2);

    const day1 = cashflows[0];
    const day2 = cashflows[1];

    expect(day1.openingBalance).toBe(0);
    expect(day1.closingBalance).toBe(200);

    expect(day2.openingBalance).toBe(200);
    expect(day2.closingBalance).toBe(150);
  });

  it("should revert transactions when receiving inactivation events", async () => {
    const repository = new InMemoryDailyCashflowRepository();
    const useCase = new ProcessTransactionEventUseCase(repository);

    const createEvent: TransactionEvent = {
      eventType: "TRANSACTION_CREATED",
      payload: makePayload({ value: 120 }),
    };

    const inactivatePayload: TransactionInactivatedEventPayload = {
      ...(createEvent.payload as TransactionCreatedEventPayload),
      status: "inactive",
      inactivatedBy: "user-2",
    };

    await useCase.execute(createEvent);
    await useCase.execute({
      eventType: "TRANSACTION_INACTIVATED",
      payload: inactivatePayload,
    });

    const [cashflow] = await repository.findAll();
    expect(cashflow.totalCredit).toBe(0);
    expect(cashflow.closingBalance).toBe(0);
  });
});
