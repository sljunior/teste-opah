import { DailyCashflow } from "../../domain/entities/dailyCashflow";

export interface DailyCashflowRepository {
  findAll(): Promise<DailyCashflow[]>;
  saveAll(cashflows: DailyCashflow[]): Promise<void>;
}
