import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { ProcessTransactionEventUseCase } from "../../application/useCases/processTransactionEventUseCase";
import {
  LedgerTransactionEventPayload,
  TransactionEvent,
} from "../../application/events/transactionEvent";
import { JsonDailyCashflowRepository } from "../../infrastructure/repository/jsonDailyCashflowRepository";

export class CashflowProcessorWorker {
  private readonly eventsFilePath: string;
  private readonly processEventUseCase: ProcessTransactionEventUseCase;
  private readonly cashflowFilePath: string;

  constructor() {
    this.eventsFilePath = join(
      resolve(process.cwd(), ".."),
      "queue",
      "transaction.json"
    );
    this.cashflowFilePath = join(
      resolve(process.cwd(), ".."),
      "queue",
      "cashflow.json"
    );

    const repository = new JsonDailyCashflowRepository(this.cashflowFilePath);
    this.processEventUseCase = new ProcessTransactionEventUseCase(repository);
  }

  async start(): Promise<void> {
    console.log("Cashflow Processor started");

    const events = await this.loadEvents();

    for (const event of events) {
      await this.processEventUseCase.execute(event);
    }

    console.log("Cashflow Processor finished processing events");
  }

  private async loadEvents(): Promise<TransactionEvent[]> {
    try {
      const content = await readFile(this.eventsFilePath, "utf-8");
      const events: LedgerTransactionEventPayload[] = JSON.parse(content);
      return events
        .map(payload => this.toTransactionEvent(payload))
        .filter((event): event is TransactionEvent => Boolean(event));
    } catch (err) {
      console.error("Failed to load events", err);
      return [];
    }
  }

  private toTransactionEvent(
    payload: LedgerTransactionEventPayload
  ): TransactionEvent | null {
    if (
      !payload ||
      !payload.status ||
      !payload.group ||
      !payload.category
    ) {
      console.warn("Skipping invalid event payload", payload);
      return null;
    }

    if (payload.status === "inactive") {
      if (!("inactivatedBy" in payload)) {
        return null;
      }

      return {
        eventType: "TRANSACTION_INACTIVATED",
        payload,
      };
    }

    return {
      eventType: "TRANSACTION_CREATED",
      payload,
    };
  }
}
