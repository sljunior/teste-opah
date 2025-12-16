import {
  TransactionEvent,
  TransactionCreatedEventPayload,
  TransactionInactivatedEventPayload,
} from "../events/transactionEvent";
import { DailyCashflowRepository } from "../ports/dailyCashflowRepository";
import { DailyCashflow } from "../../domain/entities/dailyCashflow";

export class ProcessTransactionEventUseCase {
  constructor(private readonly repository: DailyCashflowRepository) {}

  async execute(event: TransactionEvent): Promise<void> {
    const { eventType, payload } = event;
    const dateKey = this.normalizeDate(payload.date);

    const cashflows = await this.repository.findAll();
    let cashflow = cashflows.find(cf => cf.date === dateKey);

    if (!cashflow) {
      cashflow = new DailyCashflow(dateKey);
      cashflows.push(cashflow);
    }

    if (eventType === "TRANSACTION_CREATED") {
      this.applyTransaction(cashflow, payload);
    }

    if (eventType === "TRANSACTION_INACTIVATED") {
      this.revertTransaction(cashflow, payload);
    }

    this.recalculateBalances(cashflows);
    await this.repository.saveAll(cashflows);
  }

  private applyTransaction(
    cashflow: DailyCashflow,
    payload: TransactionCreatedEventPayload
  ) {
    cashflow.applyTransaction(
      payload.group,
      payload.category,
      payload.type,
      payload.value
    );
  }

  private revertTransaction(
    cashflow: DailyCashflow,
    payload: TransactionInactivatedEventPayload
  ) {
    cashflow.revertTransaction(
      payload.group,
      payload.category,
      payload.type,
      payload.value
    );
  }

  private normalizeDate(date: string): string {
    return date.split("T")[0];
  }

  private recalculateBalances(cashflows: DailyCashflow[]): void {
    cashflows.sort((a, b) => a.date.localeCompare(b.date));
    let previousClosing: number | null = null;

    for (const cashflow of cashflows) {
      if (previousClosing === null) {
        cashflow.setOpeningBalance(cashflow.openingBalance ?? 0);
      } else {
        cashflow.setOpeningBalance(previousClosing);
      }

      previousClosing = cashflow.closingBalance;
    }
  }
}
