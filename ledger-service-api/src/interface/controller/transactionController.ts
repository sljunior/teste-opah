import { Request, Response } from "express";
import { CreateTransactionUseCase } from "../../application/useCases/createTransactionUseCase";
import { InactivateTransactionUseCase } from "../../application/useCases/inactivateTransactionUseCase";

export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly inactivateTransactionUseCase: InactivateTransactionUseCase
  ) {}
  async create(req: Request, res: Response): Promise<Response> {
    const {date, value, type, originalDocumentId, createdBy } = req.body;

    await this.createTransactionUseCase.execute({
      date: new Date(),
      value,
      type,
      originalDocumentId,
      createdBy
    });
    return res.status(201).send();
  }
  
}
