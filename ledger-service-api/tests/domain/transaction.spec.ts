import { Transaction } from "../../src/domain/entitites/Transaction";
import { describe, test, expect } from "@jest/globals";

describe("Transaction Entity", () => {
  const buildTransaction = () =>
    Transaction.create({
      id: "1",
      date: new Date(),
      value: 100,
      type: "credit",
      originalDocumentId: "doc-123",
      createdBy: "user-1",
    });

  test("should create a valid transaction", () => {
    const transaction = buildTransaction();

    expect(transaction.status).toBe("active");
    expect(transaction.creationDate).toBeInstanceOf(Date);
  });

  test("should not create transaction with invalid type", () => {
    expect(() =>
      Transaction.create({
        id: "1",
        date: new Date(),
        value: 100,
        type: "wrong type" as any,
        originalDocumentId: "doc-123",
        createdBy: "user-1",
      })
    ).toThrow('Tipo de transação deve ser "debit" ou "credit"');
  });

  test("should not create transaction without date", () => {
    expect(() =>
      Transaction.create({
        id: "1",
        date: undefined as any,
        value: 100,
        type: "credit",
        originalDocumentId: "doc-123",
        createdBy: "user-1",
      })
    ).toThrow("Data do lançamento é obrigatória");
  });

  test("should not create transaction without createdBy", () => {
    expect(() =>
      Transaction.create({
        id: "1",
        date: new Date(),
        value: 100,
        type: "credit",
        originalDocumentId: "doc-123",
        createdBy: undefined as any,
      })
    ).toThrow("Id do do usuário que cadastrou a transação é obrigatório");
  });

  test("should inactivate transaction successfully", () => {
    const transaction = buildTransaction();

    transaction.inactivate("user-2");

    expect(transaction.status).toBe("inactive");
    expect(transaction.inactivatedBy).toBe("user-2");
    expect(transaction.inactivationDate).toBeInstanceOf(Date);
  });

  test("should not inactivate transaction without user", () => {
    const transaction = buildTransaction();
    

    expect(() => transaction.inactivate("")).toThrow(
      "Ao excluir uma transação, o usuário de exclusão deve ser informado"
    );
  });
});
