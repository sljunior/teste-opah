# Controle de fluxo de caixa diário

### Objetivo da Solução:

Serviços envolvidos criam a camada de negócios que possibilita lançamento de débito e créditos para comércio. A soma desses lançamentos gerarão o Fluxo de caixa da empresa, gerando relatórios de análise financeira em base diária, para detectar a saúde do comércio.

### Requisitos de negócio da solução

- Possiblitar lançamentos de Débitos e Créditos para controle financeiro;
- Gerar fluxo de caixa diário a partir destes lançamentos
- Geração de relatório consolidado que disponibilize o saldo (Fluxo de Caixa) diário

### Domínios funcionais e Capacidade do negócio

**Requisitos não funcionais**

- Em dias de pico, serviço de **consolidação** recebe 50 requisições por segundo, com no máximo 5% de perda de requisições

### Desenho da solução (Arquitetura alvo)

#### Arquitetura inicial

#### Possibilidade de evolução

### Estimativa de Custos

#### Infraestrutura

#### Licenças/Assinaturas necessárias

#### Monitoramento e Observabilidade

#### Critérios de Segurança

## Mapa de Decisões

### Passo a passo do trabalho (Auto-organização)

1. [X] [Feito] **Requisitos de Negócio**: Inicio com criação do "Readme" do projeto, detalhando os requisitos de negócio.
2. [ ] **Desenho da arquitetura inicial**: Do requisito de negócio, desenhar arquitetura inicial, considerando o requisito nõa funcional de requisições.
3. [ ] **Validação inicial de requisitos**: Revisar arquitetura com base nos requisitos obrigatórios do exercício e diferenciais;
4. [ ] Escolha da linguagem;
   1. [ ] Documentar motivador da escolha.
5. [ ] Criar estrutura base dos serviços e stack de testes;
6. [ ] Desenvolvimento das soluções
7. [ ] Revisão do fluxo

## Detalhamento técnico

### Instalação e Configuração

#### Pré-Requisitos

#### Variáveis de Ambiente

#### Executando o projeto

Instalação de dependências

{code}
