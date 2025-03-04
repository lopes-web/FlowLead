# LeadFlow - Sistema de Gestão de Leads

## Sobre o Projeto

LeadFlow é um sistema de gestão de leads desenvolvido para ajudar empresas a gerenciar seus potenciais clientes de forma eficiente. O sistema utiliza uma interface Kanban moderna e intuitiva para visualizar e gerenciar o progresso dos leads através de diferentes estágios do funil de vendas.

## Tecnologias Utilizadas

- **Frontend:**
  - React com TypeScript
  - Tailwind CSS para estilização
  - Shadcn/UI para componentes
  - Lucide Icons para ícones
  - Date-fns para manipulação de datas
  - Date-fns-tz para fuso horário

- **Backend:**
  - Supabase para banco de dados e autenticação
  - PostgreSQL como banco de dados

## Funcionalidades Implementadas

### Sistema de Kanban
- Visualização de leads em colunas por status
- Drag and drop para mover leads entre status
- Status implementados:
  1. Não Contatado (novo)
  2. Primeiro Contato
  3. Proposta Enviada
  4. Em Negociação
  5. Fechado
  6. Perdido (com opção de ocultar)
- Design moderno com cores personalizadas para cada status
- Animações suaves de transição
- Interface responsiva
- Opção de ocultar/mostrar coluna "Perdido"

### Gestão de Leads
- Criação de novos leads com informações detalhadas:
  - Nome
  - WhatsApp
  - Instagram
  - Website
  - Origem
  - Tipo de Projeto
  - Orçamento
  - Tags
  - Anotações
  - Necessidades
  - Observações
  - Ideias
- Status inicial automático como "Não Contatado"

### Rastreamento de Tempo
- Cronômetro em tempo real para atividades
- Tipos de atividades:
  - Prospecção
  - Reunião
  - Proposta
  - Follow-up
- Histórico detalhado de atividades com:
  - Tipo de atividade
  - Hora de início
  - Hora de término
  - Duração total (horas, minutos e segundos)
  - Notas
- Filtros no histórico:
  - Por data (Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Todos)
  - Por tipo de atividade
- Atualização automática do histórico

### Dashboard de Produtividade
- Meta diária de leads (10 leads por dia)
- Recompensa visual ao atingir a meta:
  - Animação de celebração
  - Efeito de brilho
  - Ícone especial
  - Mensagem de parabéns
- Streak de dias consecutivos atingindo a meta
- Tempo total em prospecção
- Produtividade em leads/hora
- Filtros de período:
  - Hoje
  - Ontem
  - Últimos 7 dias
  - Últimos 30 dias
  - Todos os períodos

### Interface
- Design responsivo
- Tema escuro moderno
- Cores consistentes:
  - Fundo principal: #222839
  - Elementos secundários: #1c2132
  - Bordas: #2e3446
  - Destaque: #9b87f5
  - Destaque secundário: #F59E0B
- Animações suaves
- Feedback visual para interações
- Modal para edição/criação de leads
- Diálogo de confirmação para exclusão
- Tooltips informativos
- Cards informativos com ícones intuitivos

### Melhorias de UX/UI
- Cores personalizadas para cada status
- Ícones intuitivos
- Tooltips informativos
- Feedback visual para drag and drop
- Botões de ação contextuais
- Cronômetro destacado
- Histórico de atividades com filtros
- Animações de recompensa
- Layout responsivo em grid
- Cartões informativos com métricas

## Estrutura do Banco de Dados

### Tabela: leads
- id (UUID)
- nome (text)
- whatsapp (text)
- instagram (text)
- website (text)
- origem (text)
- tipoprojeto (text)
- orcamento (numeric)
- status (text)
- ultimocontato (timestamp)
- anotacoes (text)
- necessidades (text)
- observacoes (text)
- ideias (text)
- tags (text[])
- createdat (timestamp)
- updatedat (timestamp)

### Tabela: time_tracking
- id (UUID)
- activity_type (text)
- start_time (timestamp with time zone)
- end_time (timestamp with time zone)
- duration (integer)
- notes (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

## Próximos Passos

- [x] Implementar sistema de filtros
- [x] Adicionar relatórios e dashboards
- [x] Implementar metas de prospecção
- [x] Adicionar gráficos de produtividade
- [ ] Implementar sistema de notificações
- [ ] Adicionar histórico de alterações
- [ ] Melhorar sistema de tags
- [ ] Implementar busca avançada
- [ ] Adicionar integração com WhatsApp
- [ ] Implementar sistema de lembretes
- [ ] Adicionar exportação de relatórios
- [ ] Implementar metas personalizáveis
- [ ] Adicionar gráficos de conversão
- [ ] Implementar análise de funil de vendas
``` 