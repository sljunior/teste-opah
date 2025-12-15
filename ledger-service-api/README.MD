# LEDGER SERVICE API

Objetivo: recebe transações de crédito e débito devidamente categorizadas para posteriormente gerar a visualização do fluxo de caixa

## Pré-requisitos

Necessário ter instalado

- [Git](git-scm.com)
- [Node.js](nodejs.org) (versão X.X.X ou superior)
- [npm](www.npmjs.com) (geralmente incluído com o Node.js)

## Executando o projeto

Após clonar o repositório, instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Após iniciar o servidor, a aplicação estará acessível em `http://localhost:3000`.

Execute os testes

```bash
npm run test
```

## Endpoints Disponíveis

- **`POST /transactions`**: Cria uma nova transação financeira.
  Exemplo de Payload:

```bash
{
   "date": "data", //Data de competencia da transação
   "value": 195.85, // Valor da transação em reais
   "type": "credit", // Tipo da transação: debit ou credit
   "group": "OPERATIONAL", //Grupo da transação: "OPERATIONAL" | "FINANCIAL" | "INVESTMENT"
   "category": "Receita de Venda", // Categoria da transação:Texto livre
   "originalDocumentId": "dossdddc-1234li", // Número único do documento original da transação
   "createdBy": "sjunior" // ID do Usuário que está criando a transação
}
```

- **`DELETE /transactions`**: Cancela uma nova transação financeira.
  Exemplo de Payload:
  ```bash
    {
    "transactionId": "9a53cb73-81a4-40c4-a37f-c2271d2e588a", //Id da transação original a ser cancelada
    "userId": "sjunior" //id do usuário que está cancelando a transação
    }
  ```
