class Transaction {
  constructor({
    id,
    date,
    value,
    type,
    originalDocumentId,
    createdBy,
    inactivatedBy,
    creationDate,
    inactivationDate,
    status,
  }) {
    this.id = id;
    this.date = date;
    this.value = value;
    this.type = type;
    this.originalDocumentId = originalDocumentId;
    this.createdBy = createdBy;
    this.inactivatedBy = inactivatedBy;
    this.status = "active";
    this.creationDate = new Date();
    this.inactivationDate = inactivationDate;
  }

  validate() {
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

    if ((this.status === "inactive") & !this.inactivatedBy) {
      throw new Error(
        "Ao excluir uma transação, o usuário de exclusão deve ser informado"
      );
    }

    if ((this.status === "inactive") & !this.id) {
      throw new Error(
        "Id da transação a ser excluida não informado"
      );
    }
  }

  createTransaction() {
    this.validate();
    return {
      id: this.id,
      date: this.date,
      value: this.value,
      type: this.type,
      originalDocumentId: this.originalDocumentId,
      createdBy: this.createdBy,
      status: "active",
      creationDate: new Date(),
    };
  }

  inactivate(inactivationUser) {
    this.status = "inactive";
    this.inactivatedBy = inactivationUser;
    this.inactivationDate = new Date();
    this.validate();
  }

  inactivateTransaction() {
    this.validate();
    return {
      id: this.id,
      date: this.date,
      value: this.value,
      type: this.type,
      originalDocumentId: this.originalDocumentId,
      createdBy: this.createdBy,
      status: this.status,
      creationDate: this.date,
      inactivatedBy: this.inactivatedBy,
      inactivationDate: this.inactivationDate,
    };
  }
}

module.exports = Transaction;
