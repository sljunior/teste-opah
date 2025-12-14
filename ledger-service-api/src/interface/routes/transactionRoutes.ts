import { Router } from "express";
import { CreateTransactionController } from "../controller/createTransactionController";
import { InMemoryTransactionRepository } from "../../infrastructure/repository/inMemoryTransactionRepository";
import { CreateTransactionUseCase } from "../../application/useCases/createTransactionUseCase";
import { DeleteTransactionController } from "../controller/deletetransactionController";
import { InactivateTransactionUseCase } from "../../application/useCases/inactivateTransactionUseCase";
import { JsonEventPublisher } from "../../infrastructure/queue/jsonEventPublisher"
import { join, resolve } from "path";


const transactionRoutes = Router();

const repository = new InMemoryTransactionRepository();

const eventPublisher = new JsonEventPublisher(
  join(resolve(process.cwd(), ".."), "queue", "transaction.json")
);

const createTransactionUseCase = new CreateTransactionUseCase(repository, eventPublisher);
const createTransactionController = new CreateTransactionController(createTransactionUseCase);

const inactivateTransactionUseCase = new InactivateTransactionUseCase(repository, eventPublisher);
const deleteTransactionController = new DeleteTransactionController(inactivateTransactionUseCase);

transactionRoutes.post("/transactions", (req, res) => 
    createTransactionController.create(req,res)
)

transactionRoutes.delete("/transactions", (req, res) => 
    deleteTransactionController.delete(req,res)
)

export default transactionRoutes;
