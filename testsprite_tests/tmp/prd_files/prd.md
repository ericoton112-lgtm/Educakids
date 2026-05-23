# Documento de Requisitos do Produto (PRD) - Educakids

## 1. Visão Geral do Produto
O **Educakids** é um aplicativo web voltado para professores e coordenadores da Educação Infantil. O objetivo do sistema é facilitar a gestão de sala de aula, controle de presença, humor dos alunos, planejamento pedagógico semanal alinhado à BNCC (Base Nacional Comum Curricular), além da geração automatizada de folhas de atividades personalizadas para os alunos usando Inteligência Artificial (Gemini API) e exploração de recursos pedagógicos interativos de áudio, voz, histórias e mini-jogos.

---

## 2. Público-Alvo
Professores, auxiliares de sala e coordenadores pedagógicos da Educação Infantil no Brasil.

---

## 3. Principais Módulos e Funcionalidades

### 3.1. Painel Principal (Dashboard)
- **Saudação Dinâmica**: Saudação com base na hora do dia (Bom dia, Boa tarde, Boa noite).
- **Atividade do Dia**: Exibe a próxima atividade planejada para o dia atual com botão de "Iniciar" para abrir o Modo Aula com o passo a passo interativo da atividade.
- **Resumo da Sala**: Indicador rápido de quantos alunos estão presentes/ausentes com link direto para a página de Sala (Classroom).
- **Humor da Turma**: Resumo visual dos sentimentos reportados da turma (Feliz, Neutro, Triste).
- **Focos do Dia (To-Do List)**: Permite ao professor adicionar lembretes e tarefas para o dia e marcá-los como concluídos com persistência no LocalStorage.
- **Agenda da Semana**: Exibe os focos e atividades de cada dia da semana atual de forma simplificada.

### 3.2. Agenda (Planejador Semanal / Planner)
- **Calendário Interativo**: Navegação semanal e seleção da semana ativa.
- **Feriados Nacionais**: Identificação e listagem automática dos feriados nacionais brasileiros no calendário de planejamento.
- **Gerador de Planejamento com IA**: Permite preencher data de início, faixa etária (Bebês, Crianças Bem Pequenas, Crianças Pequenas, Crianças Maiores), tema da semana e diretrizes para gerar um plano completo com objetivos e atividades diárias (Segunda a Sexta) com a API do Gemini alinhado à BNCC.
- **Edição Manual**: Permite editar os objetivos e os focos de cada dia diretamente e salvar na nuvem (Supabase) ou localmente.
- **Dicas de Ouro**: Dicas pedagógicas rotativas geradas de acordo com o tema planejado.
- **Gerar Folha com IA (Integração)**: Botão ao lado de cada atividade diária salva que redireciona o usuário para a página de Gerador de Atividades (`/activities`) preenchendo automaticamente os parâmetros de tema e tipo de atividade na URL (`?theme=...&type=...`).

### 3.3. Gerador de Atividades
- **Configuração Manual (Aba "Livre")**:
  - **Faixa Etária**: Seleção da faixa etária recomendada.
  - **Tema ou Tópico**: Input de texto livre para definir o tema.
  - **Dificuldade Cognitiva**: Botões para selecionar Baixa, Média ou Alta.
  - **Tipo de Atividade**: Caixa de seleção com opções como Pintura, Alfabetização, Cognitiva, Motora, etc.
- **Importação de Planejamento (Aba "Importar do Planejamento")**:
  - Permite selecionar uma semana planejada salva anteriormente.
  - Exibe a lista das atividades salvas de Segunda a Sexta.
  - Ao selecionar uma atividade diária planejada, preenche automaticamente o Tema/Tópico e o Tipo de Atividade no formulário de geração.
  - Mantém total liberdade para a professora editar qualquer campo manualmente após a importação e antes de iniciar a geração com IA.
- **Integração com IA**: Envia os parâmetros para a API do Gemini e gera uma atividade detalhada contendo título, materiais necessários, instruções passo a passo, perguntas/comandos da folha do aluno e prompts de ilustração em inglês.
- **Visualização da Folha do Aluno**: Pré-visualização da folha de exercícios formatada pronta para o aluno.
- **Impressão com Ilustrações**: Integração com serviço de impressão para gerar PDFs com as ilustrações desenhadas pela IA para cada comando.
- **Histórico**: Barra lateral que armazena localmente no localStorage as últimas 20 atividades geradas.

### 3.4. Sala de Aula (Gestão de Alunos / Classroom)
- **Painel de Chamada**: Lista de alunos para marcar presença ou ausência.
- **Registro de Comportamento**: Botões rápidos para definir a reação comportamental diária de cada aluno (carinha feliz, neutra ou triste).
- **Adicionar e Editar Alunos**: Modal para cadastro e edição de alunos contendo nome, turma, observações pedagógicas, tags de comportamento/alergias, e cor de fundo personalizada.

### 3.5. Biblioteca & Exploração Pedagógica (Explore)
- **Busca e Filtros BNCC**: Pesquisa de recursos filtrando por faixa etária (0-1 Ano, 2-3 Anos, 4-5 Anos) e pelos campos de experiência da BNCC (O Eu, o Outro e o Nós; Corpo, Gestos e Movimentos; Traços, Sons, Cores e Formas; Escuta, Fala e Pensamento; Espaços, Tempos, Quantidades, Relações e Transformações).
- **Geração de Conteúdo com IA**: Criação dinâmica de novas Histórias ou Cantigas a partir de um tema inserido na busca.
- **Histórias Interativas**: Narrativas ilustradas com suporte a leitura por síntese de voz (Text-to-Speech do navegador em pt-BR) e ações de engajamento físico (ex: "dar carinho", "bater palmas", "respirar fundo", "soprar balão").
- **Músicas e Karaokê**: Cantigas clássicas e geradas por IA com exibição de letras sincronizadas e reprodução de melodia via sintetizador Web Audio API em tempo real (notas de xilofone).
- **Mini-jogos Educativos**:
  - *Jogo da Memória*: Temas de Animais, Frutas e Carros com contador de jogadas e efeitos sonoros.
  - *Jogos de Reflexo*: Desafios rápidos como colheita de frutas, estouro de balões e captura de estrelas cadentes.
  - *Quizzes Pedagógicos*: Desafios de identificação de formas geométricas, detetive dos animais (com dicas), contagem visual de emojis e associação lógica de opostos.

### 3.6. Calendário Geral (Calendar)
- **Visualização Mensal**: Grid completo dos dias do mês com indicação de eventos planejados.
- **Categorização de Eventos**: Reuniões pedagógicas, celebrações (aniversários) e atividades externas.
- **Filtragem Rápida**: Botões para selecionar apenas categorias de eventos desejadas.
- **Inclusão de Eventos**: Botão flutuante simulando a criação rápida de novos compromissos na agenda escolar.

### 3.7. Perfil do Professor & Estatísticas (Profile)
- **Dados do Usuário**: Exibição e edição do nome do professor, turmas sob responsabilidade e instituição escolar.
- **Avatar Personalizado**: Carregamento de imagem local com fallback.
- **Painel de Estatísticas**: Contagem de alunos cadastrados, folhas de atividades geradas e planejamentos criados.
- **Mural de Conquistas (Achievements)**: Sistema que desbloqueia medalhas e títulos interativos conforme o engajamento com o sistema.
- **Configurações Gerais**: Alternador de tema visual (Modo Escuro / Modo Claro), controle de notificações e atalho para instalação do aplicativo (PWA).

---

## 4. Requisitos Não Funcionais e Detalhes Técnicos
- **Design e Responsividade**: Interface moderna baseada em glassmorphism, com cores HSL dinâmicas e transições suaves através do Framer Motion. Adaptabilidade total para celulares, tablets e computadores.
- **Tecnologias Utilizadas**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (Autenticação e RLS para dados em nuvem) e LocalStorage (persistência local e funcionamento em fallback offline).
- **Integração de APIs de Mídia**: Utilização da Web Speech API para reprodução de áudio narrado de histórias e Web Audio API para síntese sonora do karaokê sem dependência de bibliotecas externas pesadas.
