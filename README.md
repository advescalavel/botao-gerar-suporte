# Botão de chamado técnico — Sofia (Contact Center)

Dois arquivos, dois papéis:

- **`instalar-widget.html`** — abre uma vez só, dentro de um App Local no Bitrix24, pra registrar o botão. Não é usado no dia a dia depois disso.
- **`botao-chamado-suporte.html`** — é o que o colaborador vê quando clica no botão durante o atendimento. Roda toda vez que alguém clica.

## Passo a passo

1. **Hospedar os dois arquivos** em um domínio HTTPS público (pode ser o mesmo domínio do n8n, um subdomínio no Hostinger, Vercel, Netlify — qualquer HTTPS acessível de fora).

2. **Editar `botao-chamado-suporte.html`**: trocar `N8N_WEBHOOK_URL` (topo do `<script>`) pela URL real do webhook dedicado da Sofia.

3. **Criar um Aplicativo Local no Bitrix24**:
   `Aplicações → Outro → Aplicação Local`. No campo de link/handler, apontar para `instalar-widget.html` já hospedado. Escopo (`scope`) necessário: `im` (para `placement.bind`/`unbind`) — `user.current` já vem no escopo básico.

4. **Abrir o app** (aparece no menu esquerdo do Bitrix24). Na tela, colar a URL real de `botao-chamado-suporte.html` já hospedado no campo indicado e clicar **"Ativar botão"**.

5. **Testar**: abrir um chat de Open Line (Contact Center) em andamento, ir no painel acima do campo de mensagem, clicar no botão "Abrir chamado técnico". Deve aparecer o estado de carregamento → confirmação, sem nenhuma mensagem visível ao cliente.

## Notas

- `context: 'LINES'` no `placement.bind` garante que o botão só aparece em chats de Open Line — não aparece em chats internos entre colaboradores.
- Se precisar trocar a URL do webhook ou reativar o botão depois de uma mudança, é só abrir `instalar-widget.html` de novo e clicar "Ativar" — o registro é idempotente (substitui o handler anterior).
- Botão "Remover botão" desativa o widget completamente (`placement.unbind`), caso precise tirar de produção.
