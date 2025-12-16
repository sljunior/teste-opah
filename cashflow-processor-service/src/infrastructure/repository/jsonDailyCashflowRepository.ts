import { promises as fs } from "fs";
import { dirname } from "path";
import {
  DailyCashflow,
  DailyCashflowSnapshot,
} from "../../domain/entities/dailyCashflow";
import { DailyCashflowRepository } from "../../application/ports/dailyCashflowRepository";

export class JsonDailyCashflowRepository implements DailyCashflowRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async findAll(): Promise<DailyCashflow[]> {
    const snapshots = await this.readAll();
    return Object.keys(snapshots)
      .sort()
      .map(date => DailyCashflow.fromSnapshot(snapshots[date]));
  }

  async saveAll(cashflows: DailyCashflow[]): Promise<void> {
    return this.enqueue(async () => {
      const data: Record<string, DailyCashflowSnapshot> = {};
      cashflows
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(cashflow => {
          data[cashflow.date] = cashflow.toSnapshot();
        });

      await this.writeAll(data);
    });
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const nextTask = this.writeQueue.then(task, task);
    this.writeQueue = nextTask.catch(() => undefined);
    return nextTask;
  }

  private async readAll(): Promise<Record<string, DailyCashflowSnapshot>> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async writeAll(data: Record<string, DailyCashflowSnapshot>) {
    await this.ensureDirectory();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private async ensureDirectory(): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true });
  }
}
