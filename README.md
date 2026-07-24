# Botão de chamado técnico — Sofia (Contact Center)

Quatro arquivos estáticos + duas functions:

- **`index.html`** — porta de entrada, evita 404 na raiz do domínio.
- **`instalar-widget.html`** — abre uma vez só, dentro do App Local no Bitrix24, pra registrar o botão. Não é usado no dia a dia depois disso.
- **`botao-chamado-suporte.html`** — é o que o colaborador vê quando clica no botão durante o atendimento. Roda toda vez que alguém clica.
- **`api/instalar.js`** e **`api/suporte.js`** — functions serverless (Vercel detecta `/api/*.js` automaticamente, sem precisar de framework). Existem só porque o Bitrix24 chama o "Caminho do manipulador" e o `HANDLER` de um placement via **POST**, e um arquivo `.html` estático não responde bem a POST no Vercel (tela em branco). Cada function aceita o POST e devolve um HTML mínimo com `window.location.href` redirecionando pro `.html` estático real, que aí sim carrega `BX24.js` normalmente.

## Passo a passo

1. **Hospedar tudo** (os 4 arquivos `.html` + a pasta `api/`) no mesmo projeto Vercel, na raiz.

2. **Editar `botao-chamado-suporte.html`**: trocar `N8N_WEBHOOK_URL` (topo do `<script>`) pela URL real do webhook dedicado da Sofia.

3. **Criar o Aplicativo Local no Bitrix24** (`Aplicações → Outro → Aplicação local`, tipo **Servidor**):
   - **Seu caminho do manipulador**: `https://SEU-DOMINIO.vercel.app/api/instalar`
   - **Caminho de instalação inicial**: `https://SEU-DOMINIO.vercel.app/api/instalar` (mesma URL — assim o `placement.bind` já roda sozinho na instalação)
   - **Apenas script (sem interface de usuário)**: deixar desmarcado
   - **Atribuir permissões**: adicionar o escopo **`im`** (obrigatório para `placement.bind`/`unbind` — sem ele a ativação falha por permissão)

4. **Salvar**. O app deve abrir `instalar-widget.html` (via redirect do `/api/instalar`) já com o campo de URL preenchido como `https://SEU-DOMINIO.vercel.app/api/suporte` — confirme que está certo antes de clicar **"Ativar botão"**.

5. **Testar**: abrir um chat de Open Line (Contact Center) em andamento, ir no painel acima do campo de mensagem, clicar no botão "Abrir chamado técnico". Deve aparecer o estado de carregamento → confirmação, sem nenhuma mensagem visível ao cliente.

## Notas

- `context: 'LINES'` no `placement.bind` garante que o botão só aparece em chats de Open Line — não aparece em chats internos entre colaboradores.
- Se precisar trocar a URL do webhook ou reativar o botão depois de uma mudança, é só abrir `instalar-widget.html` de novo e clicar "Ativar" — o registro é idempotente (substitui o handler anterior).
- Botão "Remover botão" desativa o widget completamente (`placement.unbind`), caso precise tirar de produção.
