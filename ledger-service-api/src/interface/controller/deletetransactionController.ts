import { Request, Response } from "express";
import { InactivateTransactionUseCase } from "../../application/useCases/inactivateTransactionUseCase";

export class DeleteTransactionController {
  constructor(
    private readonly inactivateTransactionUseCase: InactivateTransactionUseCase
  ) {}

  async delete(req: Request, res: Response): Promise<Response> {
    const { transactionId, userId } = req.body;
    try {
      await this.inactivateTransactionUseCase.execute({
        transactionId,
        userId,
      });
      return res.status(201).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
