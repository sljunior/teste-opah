import { CashflowProcessorWorker } from "./interface/worker/cashflowProcessorWorker";

async function bootstrap() {
  const worker = new CashflowProcessorWorker();
  await worker.start();
}

bootstrap();
