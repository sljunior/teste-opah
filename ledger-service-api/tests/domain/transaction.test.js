const Transaction = require("../../src/domain/entitites/Transaction");

describe("Transactions Entity", () => {
  const buildTransaction = () =>
    new Transaction({
      id: "1",
      date: new Date(),
      value: 100,
      type: "credit",
      originalDocumentId: "doc-123",
      createdBy: "user-1",
      status: "active",
    });

  test("Should create a new valid transaction", () => {
    const transaction = buildTransaction();

    transaction.createTransaction();

    expect(transaction.status).toBe("active");
    expect(transaction.date).toBeInstanceOf(Date);
    expect(transaction.value).toBe(Number(100));
    expect(transaction.type).toBe("credit");
    expect(transaction.originalDocumentId).toBe("doc-123");
    expect(transaction.createdBy).toBe("user-1");
    expect(transaction.creationDate).toBeInstanceOf(Date);
    expect(transaction.inactivatedBy).toBe(undefined);
    expect(transaction.inactivationDate).toBe(undefined);
  });

  test("Should not create transaction if invalid type", () => {
    const transaction = buildTransaction();
    transaction.type = "wrongType";

    expect(() => {
      transaction.createTransaction();
    }).toThrow('Tipo de transação deve ser "debit" ou "credit"');
  });

  test("Should not create transaction if transaction date was not informed", () => {
    const transaction = buildTransaction();
    transaction.date = undefined;

    expect(() => {
      transaction.createTransaction();
    }).toThrow("Data do lançamento é obrigatória");
  });

  test("Should not create transaction if creation user was not informed", () => {
    const transaction = buildTransaction();
    transaction.createdBy = undefined;

    expect(() => {
      transaction.createTransaction();
    }).toThrow("Id do do usuário que cadastrou a transação é obrigatório");
  });

  test("Should not create transaction if creation user was empty", () => {
    const transaction = buildTransaction();
    transaction.createdBy = "";

    expect(() => {
      transaction.createTransaction();
    }).toThrow("Id do do usuário que cadastrou a transação é obrigatório");
  });

  test("Should not create transaction if transaction status wat not active or inactive ", () => {
    const transaction = buildTransaction();
    transaction.status = undefined;

    expect(() => {
      transaction.createTransaction();
    }).toThrow('Tipo de transação deve ser "active" ou "inactive"');
  });

  test("Should inactivate an transaction sucessfully", () => {
    const transaction = buildTransaction();
    transaction.createTransaction();

    transaction.inactivate("inactvation-user");

    expect(transaction.inactivatedBy).toBe("inactvation-user");
    expect(transaction.inactivationDate).toBeInstanceOf(Date);
    expect(transaction.status).toBe("inactive");
  });

  test("Should not inactivate an transaction if inactivation user was not informed ", () => {
    const transaction = buildTransaction();
    transaction.createTransaction();
    transaction.id = undefined;

    expect(() => {
      transaction.inactivate("user-01");
    }).toThrow(
      "Id da transação a ser excluida não informado"
    );
  });
});
