# EducaKids - Plataforma de Gestão Educacional com IA

Uma plataforma completa para gestão de creches e jardins de infância com inteligência artificial integrada, desenvolvida com Next.js, TypeScript e Tailwind CSS.

## 🚀 Características

### 🎓 Gestão de Alunos
- Cadastro completo de alunos com avatars personalizados
- Controle de presença e comportamento em tempo real
- Tags pedagógicas personalizáveis
- Histórico de notas e observações

### 📅 Planejamento Semanal
- Calendário interativo com feriados brasileiros
- Geração automática de planejamento com IA (Gemini)
- Alinhamento com diretrizes BNCC
- Objetivos e temas semanais

### 🎨 Atividades Criativas
- Geração de atividades educativas com IA
- Folhas de atividades personalizáveis
- Print otimizado para impressão
- Categorias por área de desenvolvimento

### 💻 Tecnologia
- **Next.js 15** - Framework React full-stack
- **TypeScript** - Tipagem segura
- **Tailwind CSS** - Design responsivo
- **Supabase** - Backend como serviço
- **Gemini AI** - Inteligência artificial
- **Lucide React** - Ícones modernos
- **Motion** - Animações suaves

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

1. Clone o repositório:
```bash
git clone https://github.com/ericoton112-lgtm/Educakids.git
cd Educakids
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

4. Execute o projeto:
```bash
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:3000` para ver o projeto.

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# Gemini AI API Key
GEMINI_API_KEY="sua_chave_da_api_gemini_aqui"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://seuprojeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anonima_supabase_aqui"
```

### Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Configure as tabelas necessárias (consulte `supabase_setup.sql`)
4. Copie as URL e chave do projeto para as variáveis de ambiente

### Configuração do Gemini AI

1. Acesse o [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione ao arquivo `.env.local`

## 🚀 Deploy na Vercel

### Método 1: Via CLI (Recomendado)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy do projeto:
```bash
vercel
```

4. Siga as instruções para configurar o ambiente

### Método 2: Via GitHub

1. Conecte seu repositório ao Vercel:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Selecione seu repositório Educakids

2. Configure as variáveis de ambiente:
   - Vá para "Settings" > "Environment Variables"
   - Adicione as variáveis de ambiente necessárias

3. Clique em "Deploy"

## 📁 Estrutura de Pastas

```
educakids/
├── app/                    # App Router do Next.js
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── activities/   # Página de atividades
│   │   ├── classroom/    # Página de gestão de sala
│   │   ├── planner/       # Página de planejamento
│   │   └── layout.tsx    # Layout do dashboard
│   └── api/              # API routes
│       └── genai/        # endpoints de IA
├── app/                  # Página principal
├── components/           # Componentes React
├── context/             # Contextos React
├── lib/                 # Utilidades e configurações
├── public/              # Arquivos estáticos
└── styles/              # Estilos globais
```

## 🔍 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Constrói o projeto para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
```

## 🛠️ Desenvolvimento

### Adicionar Novas Páginas
1. Crie novas rotas na pasta `app/(dashboard)/`
2. Adicione os componentes correspondentes
3. Atualize o layout se necessário

### Modificar Estilos
- Utilize Tailwind CSS classes
- Adicione variáveis personalizadas no arquivo `tailwind.config.js`
- Utilize o contexto `ThemeContext` para temas

### Integração com IA
- As chamadas para Gemini estão em `app/api/genai/`
- Adicione novos endpoints conforme necessário
- Utilize o `PrintContext` para funcionalidades de impressão

## 📋 Próximos Passos

- [ ] Adicionar autenticação de usuários
- [ ] Implementar notificações em tempo real
- [ ] Adicionar exportação de relatórios
- [ ] Implementar modo offline
- [ ] Adicionar upload de imagens

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Envie um email para: seu-email@exemplo.com

---

**Desenvolvido com ❤️ para educadores e crianças**