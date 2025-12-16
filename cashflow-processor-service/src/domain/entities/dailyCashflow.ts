export type CashflowType = "credit" | "debit";
export type CashflowGroup = "OPERATIONAL" | "FINANCIAL" | "INVESTMENT";

export interface CashflowEntrySnapshot {
  group: CashflowGroup;
  category: string;
  credit: number;
  debit: number;
}

export interface DailyCashflowSnapshot {
  date: string;
  entries: CashflowEntrySnapshot[];
  openingBalance: number;
  closingBalance: number;
}

export class CashflowEntry {
  constructor(
    public readonly group: CashflowGroup,
    public readonly category: string,
    private _credit: number = 0,
    private _debit: number = 0
  ) {}

  static fromSnapshot(snapshot: CashflowEntrySnapshot): CashflowEntry {
    return new CashflowEntry(
      snapshot.group,
      snapshot.category,
      snapshot.credit,
      snapshot.debit
    );
  }

  apply(type: CashflowType, value: number): void {
    if (type === "credit") {
      this._credit += value;
    } else {
      this._debit += value;
    }
  }

  revert(type: CashflowType, value: number): void {
    if (type === "credit") {
      this._credit -= value;
    } else {
      this._debit -= value;
    }
  }

  get credit(): number {
    return this._credit;
  }

  get debit(): number {
    return this._debit;
  }

  get balance(): number {
    return this._credit - this._debit;
  }

  toSnapshot(): CashflowEntrySnapshot {
    return {
      group: this.group,
      category: this.category,
      credit: this._credit,
      debit: this._debit,
    };
  }
}

export class DailyCashflow {
  private readonly entries: Map<string, CashflowEntry>;
  private _openingBalance: number;
  private _closingBalance: number;

  constructor(
    public readonly date: string,
    initialEntries: CashflowEntry[] = [],
    openingBalance: number = 0
  ) {
    this.entries = new Map(
      initialEntries.map(entry => [this.entryKey(entry.group, entry.category), entry])
    );
    this._openingBalance = openingBalance;
    this._closingBalance = openingBalance;
    this.updateClosingBalance();
  }

  static fromSnapshot(snapshot: DailyCashflowSnapshot): DailyCashflow {
    const entries = snapshot.entries.map(CashflowEntry.fromSnapshot);
    const cashflow = new DailyCashflow(
      snapshot.date,
      entries,
      snapshot.openingBalance ?? 0
    );
    cashflow.updateClosingBalance();
    return cashflow;
  }

  applyTransaction(
    group: CashflowGroup,
    category: string,
    type: CashflowType,
    value: number
  ): void {
    const entry = this.getOrCreateEntry(group, category);
    entry.apply(type, value);
    this.updateClosingBalance();
  }

  revertTransaction(
    group: CashflowGroup,
    category: string,
    type: CashflowType,
    value: number
  ): void {
    const entry = this.getOrCreateEntry(group, category);
    entry.revert(type, value);
    this.updateClosingBalance();
  }

  get totalCredit(): number {
    return this.entriesList.reduce((total, entry) => total + entry.credit, 0);
  }

  get totalDebit(): number {
    return this.entriesList.reduce((total, entry) => total + entry.debit, 0);
  }

  get balance(): number {
    return this.totalCredit - this.totalDebit;
  }

  get entriesList(): CashflowEntry[] {
    return Array.from(this.entries.values());
  }

  get openingBalance(): number {
    return this._openingBalance;
  }

  get closingBalance(): number {
    return this._closingBalance;
  }

  setOpeningBalance(value: number): void {
    this._openingBalance = value;
    this.updateClosingBalance();
  }

  toSnapshot(): DailyCashflowSnapshot {
    return {
      date: this.date,
      entries: this.entriesList.map(entry => entry.toSnapshot()),
      openingBalance: this._openingBalance,
      closingBalance: this._closingBalance,
    };
  }

  private getOrCreateEntry(
    group: CashflowGroup,
    category: string
  ): CashflowEntry {
    const key = this.entryKey(group, category);
    let entry = this.entries.get(key);

    if (!entry) {
      entry = new CashflowEntry(group, category);
      this.entries.set(key, entry);
    }

    return entry;
  }

  private entryKey(group: CashflowGroup, category: string): string {
    return `${group}-${category.toLowerCase()}`;
  }

  private updateClosingBalance(): void {
    this._closingBalance = this._openingBalance + this.balance;
  }
}
