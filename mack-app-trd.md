# Technical Requirements Document (TRD) - V3 (Final)

**Projeto:** Sistema de Gestão Integrada e Copiloto Inteligente – Rotaract Club Universidade Mackenzie  
**Autor:** Wallace Ribeiro  
**Tecnologias Core:** VS Code, Next.js/React (App Router), Tailwind CSS, Supabase (PostgreSQL, Auth, RLS), Google AI Studio (Gemini API)

---

## 1. Visão Geral do Produto e Objetivo
O objetivo deste projeto é realizar a migração e evolução tecnológica do sistema legado em No-code (Glide) para uma arquitetura moderna baseada em código e banco de dados relacional. O aplicativo servirá como um ERP administrativo para a diretoria e associados do clube, resolvendo problemas de descentralização de informações, histórico de projetos e gestão cronológica, além de incorporar uma camada de inteligência analítica baseada em IA Generativa para sumarização de atas e desdobramentos de projetos.

---

## 2. Escopo do Módulo Mínimo Viável (MVP)
O escopo está delimitado em 4 módulos principais interligados, focados na facilidade de uso via dispositivos móveis (Mobile-First) e painel web completo (Desktop):

1. **Módulo de Autenticação e Gestão de Perfis:** Login seguro por e-mail/senha utilizando Supabase Auth. Inclui uma visualização pública (Vitrine) na aba de Associados para atração de novos quadros sem expor dados privados de contato.
2. **Módulo de Projetos e Avenidas:** Visualização, adição de novos projetos e detalhamento do pipeline do clube, segmentados estritamente pelas 8 Avenidas de Ação tradicionais do Rotary/Rotaract.
3. **Módulo de Linha do Tempo e Agenda:** Sincronização, listagem cronológica e cadastro de novos compromissos oficiais, diferenciando eventos do clube, do Distrito 4563 ou da Rotaract Brasil.
4. **Módulo Copiloto Corporativo (IA):** Uma interface de chat baseada em linguagem natural que consome as atas e comentários do banco de dados (RAG) para gerar resumos de status, pendências e planos de ação automatizados.

---

## 3. Especificações da Arquitetura de Dados (Back-end)
A presença e a lógica de banco rodam no **Supabase** (PostgreSQL). O modelo de dados segue a estrutura relacional abaixo:

### 3.1. Tipos Customizados (`ENUM`)
* **`avenida_projeto`**: `['Desenvolvimento de Quadro Associativo', 'Captação de Recursos', 'Comunitários', 'Meio Ambiente', 'Internacionais', 'Imagem Pública', 'Profissionais', 'Ação']`
* **`categoria_comentario`**: `['Alinhamento', 'Decisão', 'Tarefa', 'Gargalo', 'Geral']`
* **`tipo_evento`**: `['Clube', 'Distrito 4563', 'Rotaract Brasil']`

### 3.2. Dicionário de Tabelas Core

#### `public.associados`
* **Colunas:** `id` (UUID, PK), `nome_completo` (text), `nome_social` (text), `email` (text), `telefone` (text), `foto_url` (text), `cargo` (text), `profissao` (text), `sobre_mim` (text), `role` (text, default: 'membro').
* *Regra de Exposição de Dados:* Caso o usuário não esteja autenticado (Convidado), as colunas `email` e `telefone` devem ser ocultadas/mascaradas na interface.

#### `public.projetos`
* **Colunas:** `id` (UUID, PK), `nome_projeto` (text), `status` (text), `marco_atual` (text), `avenida` (avenida_projeto), `lider_id` (UUID, FK -> `associados.id`), `detalhes` (text), `link_grupo` (text).

#### `public.comentarios_projetos` (Base de Conhecimento para o Copiloto)
* **Colunas:** `id` (UUID, PK), `projeto_id` (UUID, FK -> `projetos.id` ON DELETE CASCADE), `autor_id` (UUID, FK -> `associados.id`), `categoria` (categoria_comentario), `titulo` (text), `comentario` (text), `data_comentario` (timestamp).

#### `public.calendario_reunioes`
* **Colunas:** `id` (UUID, PK), `titulo` (text), `data_hora` (timestamp), `referente_a` (tipo_evento), `projeto_id` (UUID, FK -> `projetos.id` NULL), `organizador_id` (UUID, FK -> `associados.id`), `link_meet` (text).

#### `public.copilot_interactions` (Histórico de Conversas do Chat)
* **Colunas:** `id` (UUID, PK), `user_id` (UUID, FK -> `associados.id`), `prompt` (text), `resposta` (text), `projeto_contexto_id` (UUID, FK -> `projetos.id` NULL), `created_at` (timestamp).

---

## 4. Requisitos de Interface (UI/UX) & Responsividade
A interface é construída utilizando **React** e **Tailwind CSS**:
* **Design Aesthetic:** Tema Claro (Off-White `#F8F9FA` predominante, destaque de alto impacto em Cranberry `#D91B5C`, elementos institucionais em Amarelo Rotary `#F7A81B` e tipografia Inter).
* **Responsividade Mobile-First & Desktop:**
  * **Navegação:** No mobile, exibe `BottomNav.tsx` fixado na base. No desktop (`md:`), oculta a barra inferior e renderiza a `Sidebar.tsx` fixa no canto esquerdo.
  * **Grids:** Listas de projetos, eventos e associados se adaptam de 1 coluna (mobile) para grids de 2 a 3 colunas em telas maiores.
  * **Modais:** Telas de detalhes (`DetalhesProjeto`, `DetalhesMembro`, `DetalhesEvento`) e formulários de adição abrem em tela cheia no mobile, e como modais flutuantes elegantes com backdrop desfocado em telas de desktop.

---

## 5. Requisitos de IA Generativa & Engenharia de Prompt
O sistema integrará a API do Gemini via Google AI Studio utilizando:
* **Retrieval-Augmented Generation (RAG):** Busca direta das colunas `comentario` e `categoria` da tabela `public.comentarios_projetos` para responder a perguntas contextuais sobre as decisões do clube.
* **Geração de Resumos (One-click):** Funcionalidade para condensar as discussões de um projeto em 3 parágrafos estruturados (Status, Gargalos, Próximos Passos).