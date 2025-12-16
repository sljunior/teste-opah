# Controle de fluxo de caixa diário

### Objetivo da Solução:

Serviços envolvidos criam a camada de negócios que possibilita lançamento financeiros de débito e créditos para comércio. A soma desses lançamentos gerarão o Fluxo de caixa da empresa, gerando relatórios de análise financeira em base diária, para detectar a saúde do comércio.

### Suposições / Limitações de escopo

- Como lançamento de Débito e Crédito, estou assumindo que são lançamentos financeiros (Contas a Pagar e Receber) baixados, ou seja, já se refere ao lançamento finalizado, não sendo necessário controle de "Pago: Sim/Não";
- Não vamos precisar lidar com outras moedas, somente real brasileiro
- Não preciso registrar qual o Caixa ou banco onde o lançamento foi realizado, somente o lançamento em sí.

### Requisitos de negócio da solução

- Possiblitar lançamentos de Débitos e Créditos financeiros para controle financeiro;
- Gerar fluxo de caixa diário a partir destes lançamentos
- Geração de relatório consolidado que disponibilize o saldo do fluxo de caixa diário

### Exemplo de Resultado Esperado

Para o exercício, vamos gear um fluxo de caixa Diário simplificado conforme exemplo


| SALDO INICIAL |             | R$ 100,00 |
| :-------------- | ------------- | ----------- |
| OPERACIONAIS  |             |           |
| Entradas      |             |           |
|               | Categoria 1 | 50,00     |
|               | Categoria 2 | 20,00     |
| Saídas       |             |           |
|               | Categoria 1 | 10,00     |
|               | Categoria 2 | 8,00      |
| FINANCEIRAS   |             |           |
| Entradas      |             |           |
|               | Categoria 1 |           |
|               | Categoria 2 |           |
|               |             |           |
| Saídas       |             |           |
|               | Categoria 1 |           |
|               | Categoria 2 |           |

### Domínios funcionais e Capacidade do negócio

#### Domínios Funcionais

**Capacidades**

- Registrar lançamentos financeiros (Débito e Crédito);
- Cancelar lançamentos financeiros;
- Garantir idepotêmcia e rastreabilidade dos lançamentos;
- Processar cálculo de fluxo de caixa de forma assincrona
- Cálcular saldo diário consolidado;
- Disponibilizar consulta de saldo diário;

**Requisitos**

- **Funcionais**:
  - Deve permitir cadastramento lançamentos de créditos e débitos;
  - Para efeito de rastreabilidade, não deve ser possível excluir lançamentos, somente alterar o status do lançamento;
  - Estas serão as informações disponíveis em cada lançamento:

    - ID único do lançamento
    - Data do lançamento
    - Valor em Reais (R$)
    - Tipo de lançamento (Débido ou Crédito)
    - Id do documento original do lançamento (Idepotência)
    - Id do usuário do lançamento (Rastreabilidade)
    - Id do usuário de inativação (Rastreabilidade)
    - Status (Ativo / Inativo)
-
- **Não Funcionais**:
  - Deve garantir alta disponibilidade nos lançamentos;
  - Escrita transacional com idepotência;
  - Geração do fluxo de caixa não pode gerar indisponibilidade da gravação dos dados
  - Disponibilidade da leitura dos dados do Fluxo de Caixa deve ser independente da gravação dos dados

### Desenho da solução (Arquitetura alvo)

![](arquitetura/Arquitetura.png)

### Estimativa de Custos

**Cálculo de Armazenamento de transações**
Calculo estimado no pior cenário de leitura, considerando que todas as leituras gerariam algum registro de banco de dados;

- 50 registros/Seg * 86400 = 4.320.000 registros /dia = 129.600.000 registros/mês;
- Estimando 500 bytes por mensagem = 64GB em registros/mês ou 233TB/Ano

**Serviços**
Uso do Fargate EKS, garantindo escalabilidade horizontal, além de ter previsibilidade do custo com baixa manutenção;

**Custo total estimado**: USD 36K/mês (431k/ano)

- Amazon Aurora PostGreSql: 24k/mes
- Amazon SQS: 136/mês
- Elastic Load Balancing: 9.5k/mes
- AWS Fargate: 2k/mes

Estimativa detalhada disponível na pasta arquitetura,

Link público do cálculo de estrutura: https://calculator.aws/#/estimate?id=0b3e929d04c4491ee2f145af706611f84f00aa0e

## Mapa de Decisões

### Passo a passo do trabalho (Auto-organização)

1. [X] [Feito] **Requisitos de Negócio**: Inicio com criação do "Readme" do projeto, detalhando os requisitos de negócio.
2. [X] **Desenho da arquitetura inicial**: Do requisito de negócio, desenhar arquitetura inicial, considerando o requisito nõa funcional de requisições.
3. [X] **Validação inicial de requisitos**: Revisar arquitetura com base nos requisitos obrigatórios do exercício e diferenciais;
4. [X] Escolha da linguagem;
   1. [X] Documentar motivador da escolha.
5. [X] Criar estrutura base dos serviços e stack de testes;
6. [X] Desenvolvimento das soluções
7. [X] Revisão do fluxo

### Decisões de Arquitetura

1. **Serviços necessários**: No processo de criação da arquitetura e levando em conta a quantidade de requisições que o negócio exige, optei por separar as responsabilidades em três serviços com responsabilidades bem definidas:


| Serviço                   | Responsabilidade                                                                                                                                                                                                                                            |
| :--------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ledger-service-api         | Gravação dos dados de lançamentos financeiros, considerando idepotência transacional, postando resultado em fila após o final da gravação;                                                                                                           |
| cashflow-processor-service | Leitura assincrona da fila de lançamentos financeiros; Serviço será responsável por qualquer cálculo extra necessário no momento da criação dos registros que vão compor o fluxo de caixa. Este serviço não recebe chamadas de outros serviços; |
| cashflow-service-api       | Somente Leitura: responsável por ler os dados pré-calculados do fluxo de caixa e devolter ao usuário                                                                                                                                                     |

2. **Escolha do banco de dados**: Optei por banco relacional (PostGreSql) tanto para gravação inicial dos dados quanto do Fluxo de caixa, entendendo que:

   1. Dados financeiros são críticos, demandam que o armazenamento também garanta integridade transacional das informações;
   2. Postgresql atende o requisito de volume esperado tanto de gravações e leituras por segundo;
   3. A escalabilidade horizontal dos serviços garante que o processamento pelos serviços não serão o gargalo técnico das operações
3. **Escolha da Linguagem**: Para o exercício optei pelo Node.js com Typescript, pela simplicidade de codificação da linguagem, mas também considerando ser uma linguagem

   1. Amplamente difundida no mercado e com baixa curva de aprendizado, facilitando recrutamento de desenvolvedores;
   2. Grande comunidade ativa, facilitando a obtenção de pacotes e frameworks;
   3. Problema e solução propostos focam em I/O, sem cálculos complexos;
   4. Entrega performace suficiente para atendimento dos requisitos de negócio, mesmo em produção;
4. **Dados Mock**: Para o exercício proposto, decidi salvar os dados em memória/arquivo ao invés de salvar em estrutura real: Dados serão salvos em memória ao invés de banco de dados e a fila será simulada criando arquivo Json, para que assim todos os serviços consigam acessar os dados simulando transações mais próximas do real. Neste caso acaba ferindo alguns princípios como não possibilitar concorrência ou a possível reescrita completa dos arquivos a cada execução do projeto
5. Não estou realizando validações profundas, como por exemplo: O grupo/Categoria XX só pode receber lançamento de Crédito ou Débito; Em um cenário real a categoria seria pré-cadastrada, mas deixei texto livre somente como ilustração do exercício
6. O Serviço cashflow-processor-service sempre lê todos os lançamentos criados pelo ledger-service-api e não remove os lançamentos já processados, como seria o comportamento padrão de uma fila. Decisão foi tomada para facilitar o processo de visualização das informações para o exercicio proposto.
7. O serviço cash-processor-service não possui um cron para leitura constante dos novos registros, só lendo no momento que o serviço é iniciado.

IMPORTANTE: Por questão de tempo disponível, não criei o detalhamento do serviço "cashflow-service-api", entendendo que as partes mais complexas envolvem os outros dois serviços;

## Detalhamento técnico

### Instalação e Configuração

#### Ferramentas Utilizadas

* IDE: Visual Studio Code for Mac com os complementos:
  * vscode-pdf - Visualização do PDF do exercício
  * Markdown Editor - Edição do Readme do projeto
  * "*Draw.io Integration created by Henning Dieterichs*" - Criação e Visualização dos diagramas do projeto

# EXECUTANDO OS PROJETOS

Todos os projetos seguirão os mesmos padrões:

## Pré-requisitos

Necessário ter instalado

- [Git](git-scm.com)
- [Node.js](nodejs.org)
- [npm](www.npmjs.com)

## Executando o projeto

Todos os serviços necessários para o projeto estão na mesma pasta "opah";
Os passos são os mesmos abaixo para todos os serviços. É necessário acessar a pasta de cada sub-projeto (cashflow-processor-service / ledger-service-api / cashflow-service-api) e executar os comandos abaixo na sequencia:

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

### Ledger Service API

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

### Cashflow-processor-service

Serviço não disponibiliza nenhum endpoint. Ao ser executado, o serviço irá ler todos os arquivos gerados no arquivo queue/transaction.json, criado pelo ledger-service-api e criar o arquivo queue/cashflow.json com os registros do fluxo de caixa prontos para serem lidos.

### cashflow-service-api

== Serviço não implementado ==
O objetivo desse serviço para esse exercício é expor um endpoint, retornando os dados de fluxo de caixa.

Exemplo:

- **`GET /dailyCashFlow?date=yyyy-mm-dd`**: Retorna os dados do fluxo de caixa de um dia específico

```json
 "2025-12-11": {
    "date": "2025-12-11",
    "entries": [
      {
        "group": "OPERATIONAL",
        "category": "Receita de Venda",
        "credit": 120010.20000000003,
        "debit": 8388
      }
    ],
    "openingBalance": 0,
    "closingBalance": 111622.20000000003
  },
```
