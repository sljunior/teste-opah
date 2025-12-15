import { Request, Response } from "express";
import { CreateTransactionUseCase } from "../../application/useCases/createTransactionUseCase";


export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase
  ) {}
  async create(req: Request, res: Response): Promise<Response> {
    const { date, value, type, group, category, originalDocumentId, createdBy } = req.body;
    try {
      const newTransaction =  await this.createTransactionUseCase.execute({
        date: new Date(date),
        value,
        type,
        group,
        category,
        originalDocumentId,
        createdBy,
      });

      return res.status(201).json(newTransaction);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
