export type TransactionType = "debit" | "credit";
export type TransactionStatus = "active" | "inactive";
export type TransactionGroup = "OPERATIONAL" | "FINANCIAL" | "INVESTMENT";

export interface TransactionProps {
  id: string;
  date: Date;
  value: number;
  type: TransactionType;
  group: TransactionGroup;
  category: string;
  originalDocumentId: string;
  createdBy: string;
}

export class Transaction {
  public readonly id: string;
  public readonly date: Date;
  public readonly value: number;
  public readonly type: TransactionType;
  public readonly group: TransactionGroup;
  public readonly catogory: string;
  public readonly originalDocumentId: string;
  public readonly createdBy: string;
  public status: TransactionStatus;
  public readonly creationDate: Date;
  public inactivatedBy?: string;
  public inactivationDate?: Date;

  private constructor(props: TransactionProps) {
    this.id = props.id;
    this.date = props.date;
    this.value = props.value;
    this.type = props.type;
    this.group = props.group;
    this.catogory = props.category;
    this.originalDocumentId = props.originalDocumentId;
    this.createdBy = props.createdBy;
    this.status = "active";
    this.creationDate = new Date();
  }

  private validate() {
    const errors = [];
    if (!this.date) {
      throw new Error("Data do lançamento é obrigatória");
    }

    if (!this.value) {
      throw new Error("Valor da transação é obrigatório");
    }

    if (!["debit", "credit"].includes(this.type)) {
      throw new Error('Tipo de transação deve ser "debit" ou "credit"');
    }

    if (!["OPERATIONAL" , "FINANCIAL" , "INVESTMENT"].includes(this.group)) {
      throw new Error('Grupo da transação deve ser "OPERATIONAL" , "FINANCIAL" ou "INVESTMENT"');
    }

    if (!this.catogory) {
      throw new Error("Categoria da transação é obrigatória");
    }

    if (!this.originalDocumentId) {
      throw new Error("Id do documento original é obrigatório");
    }

    if (!this.createdBy || this.createdBy.trim().length === 0) {
      throw new Error(
        "Id do do usuário que cadastrou a transação é obrigatório"
      );
    }

    if (!["active", "inactive"].includes(this.status)) {
      throw new Error('Tipo de transação deve ser "active" ou "inactive"');
    }

    if (this.status === "inactive" && !this.inactivatedBy) {
      throw new Error(
        "Ao excluir uma transação, o usuário de exclusão deve ser informado"
      );
    }

    if (this.status === "inactive" && !this.id) {
      throw new Error("Id da transação a ser excluida não informado");
    }
  }

  static create(props: TransactionProps): Transaction {
    const transaction = new Transaction(props);
    transaction.validate();
    return transaction;
  }

  inactivate(userId: string): void {
    if (this.status === "inactive") {
      throw new Error("Transação já foi inativada");
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error(
        "Ao excluir uma transação, o usuário de exclusão deve ser informado"
      );
    }

    this.status = "inactive";
    this.inactivatedBy = userId;
    this.inactivationDate = new Date();
  }
}
