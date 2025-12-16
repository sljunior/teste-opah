import {
  CashflowEntry,
  CashflowEntrySnapshot,
  DailyCashflow,
} from "../../src/domain/entities/dailyCashflow";

describe("DailyCashflow", () => {
  const baseEntries: CashflowEntrySnapshot[] = [
    {
      group: "OPERATIONAL",
      category: "Receita",
      credit: 100,
      debit: 0,
    },
    {
      group: "FINANCIAL",
      category: "Despesa",
      credit: 0,
      debit: 40,
    },
  ];

  it("should aggregate credit and debit per group/category", () => {
    const cashflow = new DailyCashflow("2024-09-01", [
      CashflowEntry.fromSnapshot(baseEntries[0]),
      CashflowEntry.fromSnapshot(baseEntries[1]),
    ]);

    cashflow.applyTransaction("OPERATIONAL", "Receita", "credit", 50);
    cashflow.applyTransaction("FINANCIAL", "Despesa", "debit", 10);

    const entries = cashflow.entriesList;
    const receita = entries.find(
      entry => entry.group === "OPERATIONAL" && entry.category === "Receita"
    );
    const despesa = entries.find(
      entry => entry.group === "FINANCIAL" && entry.category === "Despesa"
    );

    expect(receita?.credit).toBe(150);
    expect(despesa?.debit).toBe(50);
    expect(cashflow.totalCredit).toBe(150);
    expect(cashflow.totalDebit).toBe(50);
  });

  it("should update balances when opening balance changes", () => {
    const cashflow = new DailyCashflow(
      "2024-09-01",
      [
        CashflowEntry.fromSnapshot(baseEntries[0]),
        CashflowEntry.fromSnapshot(baseEntries[1]),
      ],
      200
    );

    expect(cashflow.openingBalance).toBe(200);
    expect(cashflow.closingBalance).toBe(260); // 200 + (100 - 40)

    cashflow.applyTransaction("OPERATIONAL", "Receita", "credit", 40);
    expect(cashflow.closingBalance).toBe(300);

    cashflow.setOpeningBalance(50);
    expect(cashflow.closingBalance).toBe(150);
  });
});
