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
  - Recharts para gráficos interativos

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
- Sistema de filtros avançado:
  - Busca por texto
  - Filtro por status
  - Filtro por motivo de perda

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
- Modal de edição com layout otimizado
- Captura de motivo de perda ao arquivar leads

### Dashboard Analítico
- Métricas em tempo real:
  - Total de Leads
  - Taxa de Conversão
  - Valor Total em Orçamentos
  - Leads Ativos
- Gráficos interativos:
  - Leads por Mês (gráfico de área)
  - Status dos Leads (gráfico de rosca)
  - Valor por Status (gráfico de barras)
- Design moderno com:
  - Efeito glassmorphism nos cards
  - Gradientes suaves
  - Tooltips personalizados
  - Animações fluidas
  - Cores harmoniosas
- Ordenação inteligente de dados
- Responsividade total

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

### Sistema de Notificações
- Notificações em tempo real para ações importantes:
  - Criação de leads
  - Atualização de leads
  - Mudança de status
  - Exclusão de leads
  - Criação de projetos
  - Atualização de projetos
- Interface de notificações com contador de não lidas
- Marcação automática como lidas ao visualizar
- Opção para limpar todas as notificações
- Exibição do nome do usuário em vez do email
- Tooltips para visualizar mensagens completas
- Formatação de data relativa (ex: "há 5 minutos")
- Ícones intuitivos para cada tipo de notificação

### Gerenciamento de Usuários
- Página de perfil do usuário com:
  - Upload de foto de perfil
  - Edição de nome de usuário
  - Alteração de senha
  - Visualização de informações da conta
- Autenticação segura via Supabase
- Controle de acesso a leads e projetos
- Opção de leads públicos ou privados
- Indicadores visuais de propriedade de leads

### Melhorias Recentes
- Unificação do sistema de navegação
  - Navegação consistente entre todas as páginas
  - Uso de rotas para melhor experiência do usuário
  - Histórico de navegação preservado
- Otimização da conversão de leads em projetos
  - Verificação de duplicidade por nome
  - Remoção do vínculo lead-projeto
  - Logs detalhados para debugging
  - Tratamento de erros aprimorado
- Atualização do favicon com identidade visual
- Correção de problemas de interface
  - Alinhamento de colunas nas tabelas
  - Formatação de valores monetários em BRL
  - Melhorias na responsividade
- Tema escuro consistente em todas as páginas
  - Login e registro com tema escuro
  - Melhor contraste e legibilidade
  - Cores consistentes com a identidade visual

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
- created_at (timestamp)
- updated_at (timestamp)
- user_id (UUID, referência para auth.users)
- is_public (boolean)
- motivo_perda (text)
- detalhes_perda (text)

### Tabela: time_tracking
- id (UUID)
- activity_type (text)
- start_time (timestamp with time zone)
- end_time (timestamp with time zone)
- duration (integer)
- notes (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### Tabela: projects
- id (UUID)
- nome (text)
- cliente (text)
- tipo_projeto (text)
- status (text)
- valor (numeric)
- descricao (text)
- observacoes (text)
- prazo_entrega (timestamp)
- arquivos_recebidos (text[])
- created_at (timestamp)
- updated_at (timestamp)
- user_id (UUID, referência para auth.users)
- lead_id (UUID, referência para leads)

### Tabela: notifications
- id (UUID)
- type (text)
- title (text)
- message (text)
- created_at (timestamp)
- created_by (UUID, referência para auth.users)
- read_by (UUID[], array de IDs de usuários)
- data (jsonb, dados adicionais da notificação)

## Próximos Passos

- [x] Implementar sistema de filtros
- [x] Adicionar relatórios e dashboards
- [x] Implementar metas de prospecção
- [x] Adicionar gráficos de produtividade
- [x] Implementar conversão automática de leads em projetos
- [x] Unificar sistema de navegação
- [x] Melhorar tratamento de erros
- [x] Atualizar identidade visual
- [x] Implementar sistema de notificações
- [x] Adicionar edição de perfil de usuário
- [x] Melhorar design dos gráficos do dashboard
- [ ] Adicionar histórico de alterações
- [ ] Melhorar sistema de tags
- [ ] Implementar busca avançada
- [ ] Adicionar integração com WhatsApp
- [ ] Implementar sistema de lembretes
- [ ] Adicionar exportação de relatórios
- [ ] Implementar metas personalizáveis
- [ ] Adicionar gráficos de conversão
- [ ] Implementar análise de funil de vendas