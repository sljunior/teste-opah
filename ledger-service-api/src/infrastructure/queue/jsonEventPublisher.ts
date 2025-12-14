import { promises as fs } from "fs";
import { dirname } from "path";
import { EventPublisher } from "../../application/ports/eventPublisher";

export class JsonEventPublisher<T> implements EventPublisher<T> {
  constructor(private readonly filePath: string) {}

  async publish(event: T): Promise<void> {
    await this.ensureDirectoryExists();

    const events = await this.readEvents();
    events.push(event);

    await fs.writeFile(
      this.filePath,
      JSON.stringify(events, null, 2),
      "utf-8"
    );
  }

  private async readEvents(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dir = dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
  }
}
