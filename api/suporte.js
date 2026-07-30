export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abrir pedido de suporte — Sofia</title>
<script src="//api.bitrix24.com/api/v1/"></script>
<style>
  :root {
    --primary: #2B2B6E;
    --accent: #FF038F;
    --bg: #ffffff;
    --text: #1e2129;
    --text-muted: #6a7078;
    --border: #ece7f0;
    --ok: #1c9e5a;
    --ok-bg: #eafaf1;
    --err: #d84a3a;
    --err-bg: #fdecea;
    --warn-bg: #fff8e6;
    --warn: #a06a00;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); }
  body { display: flex; flex-direction: column; min-height: 100%; }

  .header { background: var(--primary); color: #fff; padding: 14px 18px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .header .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  .header h1 { font-size: 13px; font-weight: 600; margin: 0; letter-spacing: 0.2px; }
  .header span { display: block; font-size: 10.5px; color: rgba(255,255,255,0.65); margin-top: 1px; font-weight: 400; }
  .header .guia-link { font-size: 10.5px; color: rgba(255,255,255,0.85); text-decoration: none; white-space: nowrap; flex-shrink: 0; }
  .header .guia-link:hover { color: #fff; text-decoration: underline; }

  .body { flex: 1; display: flex; flex-direction: column; padding: 16px 18px; overflow: hidden; }

  /* ---- Estado simples (loading/ok/err/warn) ---- */
  .simple-state { flex: 1; display: flex; align-items: center; justify-content: center; }
  .panel { width: 100%; max-width: 300px; text-align: center; margin: 0 auto; }
  .icon { width: 42px; height: 42px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 20px; font-weight: 700; }
  .icon.loading { background: #ffe6f5; color: var(--accent); }
  .icon.ok { background: var(--ok-bg); color: var(--ok); }
  .icon.err { background: var(--err-bg); color: var(--err); }
  .icon.warn { background: var(--warn-bg); color: var(--warn); }
  .spinner { width: 18px; height: 18px; border: 2.5px solid #ffd0ec; border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  h2 { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--primary); }
  p.detail { font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.5; }
  .meta { margin-top: 14px; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px; text-align: left; }
  .meta div { margin-bottom: 3px; }

  /* ---- Estado de seleção de mensagens ---- */
  #selectionView { display: none; flex: 1; flex-direction: column; min-height: 0; }
  .selection-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-shrink: 0; }
  .selection-toolbar span.count { font-size: 11.5px; color: var(--text-muted); }
  .selection-toolbar .links a { font-size: 11px; color: var(--accent); text-decoration: none; cursor: pointer; margin-left: 10px; font-weight: 600; }
  .selection-toolbar .links a:hover { text-decoration: underline; }

  #messageList { flex: 1; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 4px; min-height: 0; }
  .msg-item { display: flex; align-items: flex-start; gap: 8px; padding: 7px 8px; border-radius: 6px; cursor: pointer; }
  .msg-item:hover { background: #fafafa; }
  .msg-item input[type="checkbox"] { margin-top: 2px; accent-color: var(--accent); flex-shrink: 0; }
  .msg-item .msg-text { font-size: 11.5px; line-height: 1.4; }
  .msg-item .msg-remetente { font-weight: 600; color: var(--primary); }
  .msg-item .msg-corpo { color: var(--text); }

  .confirm-btn { margin-top: 12px; padding: 11px 14px; border: none; border-radius: 7px; background: var(--accent); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
  .confirm-btn:hover { opacity: 0.92; }
  .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .checkbox-row { display: flex; align-items: center; gap: 7px; margin-top: 10px; font-size: 11.5px; color: var(--text-muted); flex-shrink: 0; cursor: pointer; }
  .checkbox-row input[type="checkbox"] { accent-color: var(--accent); }

  button.text-btn { margin-top: 12px; padding: 8px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid var(--border); background: #fff; color: var(--text); cursor: pointer; }
  button.text-btn:hover { background: #f4f5f7; }
</style>
</head>
<body>

  <div class="header">
    <div class="dot"></div>
    <div style="flex: 1;">
      <h1>Advocacia Escalável</h1>
      <span>Abrir pedido de suporte via Sofia</span>
    </div>
    <a href="https://docs.google.com/document/d/17Fss4zZHuNkqEtVV-nXOPWbDiJs6tlj0iogEUrYKdrA/edit?usp=sharing"
       target="_blank" rel="noopener" class="guia-link">Guia de uso ↗</a>
  </div>

  <div class="body">

    <div id="simpleState" class="simple-state">
      <div class="panel">
        <div id="icon" class="icon loading"><div class="spinner"></div></div>
        <h2 id="title">Carregando conversa…</h2>
        <p class="detail" id="detail">Buscando mensagens do atendimento.</p>
        <div class="meta" id="meta" style="display:none;"></div>
        <button id="retryBtn" class="text-btn" style="display:none;" onclick="carregarMensagens()">Tentar novamente</button>
      </div>
    </div>

    <div id="selectionView">
      <div class="selection-toolbar">
        <span class="count" id="countLabel">0 selecionadas</span>
        <span class="links">
          <a onclick="selecionarTodas(true)">Todas</a>
          <a onclick="selecionarTodas(false)">Nenhuma</a>
        </span>
      </div>
      <div id="messageList"></div>
      <label class="checkbox-row">
        <input type="checkbox" id="avisarCliente" checked>
        <span>Comunicar cliente sobre abertura do pedido</span>
      </label>
      <button class="confirm-btn" id="confirmBtn" onclick="confirmarGeracao()">Gerar pedido de suporte</button>
    </div>

  </div>

<script>
  // ---- CONFIGURAÇÃO ----
  var N8N_WEBHOOK_URL = 'https://webhook.prod.advocaciaescalaveldev.shop/webhook/sofia-gerar-pedido-de-suporte';
  // -----------------------

  var contexto = { dialogId: null, chatId: null, colaborador: null, portal: null };
  var mensagensDisponiveis = []; // [{ id, remetente, texto, data, selecionada }]

  window.onerror = function (msg, src, line) {
    setSimpleState('err', 'Erro inesperado', 'Recarregue e tente novamente.');
    var meta = document.getElementById('meta');
    meta.style.display = 'block';
    meta.textContent = 'Erro JS: ' + msg + ' (linha ' + line + ')';
    return false;
  };

  function showView(view) {
    document.getElementById('simpleState').style.display = (view === 'simple') ? 'flex' : 'none';
    document.getElementById('selectionView').style.display = (view === 'selection') ? 'flex' : 'none';
  }

  function setSimpleState(state, titleText, detailText) {
    showView('simple');
    var icon = document.getElementById('icon');
    document.getElementById('title').textContent = titleText;
    document.getElementById('detail').textContent = detailText;
    var retry = document.getElementById('retryBtn');
    icon.className = 'icon ' + state;
    if (state === 'loading') { icon.innerHTML = '<div class="spinner"></div>'; retry.style.display = 'none'; }
    else if (state === 'ok') { icon.innerHTML = '✓'; retry.style.display = 'none'; }
    else if (state === 'err') { icon.innerHTML = '!'; retry.style.display = 'inline-block'; }
    else if (state === 'warn') { icon.innerHTML = '!'; retry.style.display = 'none'; }
  }

  function limparTexto(texto) {
    return String(texto || '')
      .replace(/\\[USER=\\d+[^\\]]*\\](.*?)\\[\\/USER\\]/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\\s+/g, ' ')
      .trim();
  }

  function atualizarContador() {
    var n = mensagensDisponiveis.filter(function (m) { return m.selecionada; }).length;
    document.getElementById('countLabel').textContent = n + ' selecionada' + (n === 1 ? '' : 's');
    var btn = document.getElementById('confirmBtn');
    btn.disabled = n === 0;
    btn.textContent = n === 0 ? 'Selecione ao menos 1 mensagem' : ('Gerar pedido de suporte (' + n + ')');
  }

  function renderLista() {
    var container = document.getElementById('messageList');
    container.innerHTML = '';
    mensagensDisponiveis.forEach(function (m, idx) {
      var row = document.createElement('label');
      row.className = 'msg-item';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = m.selecionada;
      checkbox.onchange = function () {
        mensagensDisponiveis[idx].selecionada = checkbox.checked;
        atualizarContador();
      };

      var textWrap = document.createElement('div');
      textWrap.className = 'msg-text';
      var remetenteEl = document.createElement('div');
      remetenteEl.className = 'msg-remetente';
      remetenteEl.textContent = m.remetente;
      var corpoEl = document.createElement('div');
      corpoEl.className = 'msg-corpo';
      corpoEl.textContent = m.texto.length > 160 ? (m.texto.slice(0, 160) + '…') : m.texto;
      corpoEl.title = m.texto;

      textWrap.appendChild(remetenteEl);
      textWrap.appendChild(corpoEl);
      row.appendChild(checkbox);
      row.appendChild(textWrap);
      container.appendChild(row);
    });
    atualizarContador();
  }

  function selecionarTodas(valor) {
    mensagensDisponiveis.forEach(function (m) { m.selecionada = valor; });
    renderLista();
  }

  function buscarHistorico(callback) {
    if (!contexto.chatId) { callback([]); return; }
    BX24.callMethod('imopenlines.session.history.get', { CHAT_ID: contexto.chatId }, function (result) {
      if (result.error()) { callback([]); return; }
      var data = result.data();
      var msgs = data.message || {};
      var users = data.users || {};
      var lista = Object.keys(msgs).map(function (id) {
        var m = msgs[id];
        var autor = users[m.senderid];
        return { id: parseInt(id, 10), remetente: autor ? autor.name : ('usuário ' + m.senderid), texto: m.textlegacy || m.text, data: m.date };
      });
      lista.sort(function (a, b) { return a.id - b.id; });
      callback(lista);
    });
  }

  function carregarMensagens() {
    if (!contexto.dialogId) {
      setSimpleState('warn', 'Não foi possível identificar o atendimento', 'Abra este botão dentro de um chat de Open Line em andamento.');
      return;
    }
    setSimpleState('loading', 'Carregando conversa…', 'Buscando mensagens do atendimento.');

    buscarHistorico(function (mensagens) {
      var limpas = mensagens
        .filter(function (m) { return m.remetente !== 'usuário 0'; })
        .map(function (m) { return { id: m.id, remetente: m.remetente, texto: limparTexto(m.texto), data: m.data }; })
        .filter(function (m) { return m.texto.length > 0; });

      if (limpas.length === 0) {
        setSimpleState('warn', 'Nenhuma mensagem encontrada', 'Este atendimento ainda não tem mensagens pra gerar um pedido.');
        return;
      }

      mensagensDisponiveis = limpas.map(function (m) { return Object.assign({ selecionada: true }, m); });
      showView('selection');
      renderLista();
    });
  }

  function confirmarGeracao() {
    var selecionadas = mensagensDisponiveis
      .filter(function (m) { return m.selecionada; })
      .map(function (m) { return { id: m.id, remetente: m.remetente, texto: m.texto, data: m.data }; });

    if (selecionadas.length === 0) return;

    setSimpleState('loading', 'Enviando para a Sofia…', 'Transmitindo ' + selecionadas.length + ' mensagem(ns) selecionada(s).');

    var avisarCliente = document.getElementById('avisarCliente').checked;

    var payload = {
      dialog_id: contexto.dialogId,
      chat_id: contexto.chatId,
      colaborador: contexto.colaborador,
      portal: contexto.portal,
      origem: 'bitrix24_contact_center_botao',
      timestamp: new Date().toISOString(),
      avisar_cliente: avisarCliente,
      mensagens: selecionadas
    };

    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setSimpleState('ok', 'Chamado registrado', 'A equipe técnica já tem acesso às mensagens selecionadas.');
        var meta = document.getElementById('meta');
        meta.style.display = 'block';
        meta.innerHTML = '<div>Chat: ' + contexto.dialogId + '</div><div>Mensagens enviadas: ' + selecionadas.length + '</div>';
      })
      .catch(function (err) {
        setSimpleState('err', 'Falha ao registrar', 'Não foi possível falar com a Sofia agora.');
        var meta = document.getElementById('meta');
        meta.style.display = 'block';
        meta.textContent = 'Erro no fetch: ' + err.message;
      });
  }

  function iniciar() {
    BX24.init(function () {
      var info = {};
      try { info = BX24.placement.info() || {}; } catch (e) {}
      var options = info.options || {};
      contexto.dialogId = options.dialogId || null;
      contexto.chatId = contexto.dialogId ? contexto.dialogId.replace(/^chat/, '') : null;

      var auth = BX24.getAuth ? BX24.getAuth() : null;
      contexto.portal = auth ? auth.domain : null;

      BX24.callMethod('user.current', {}, function (result) {
        if (!result.error()) {
          var u = result.data();
          contexto.colaborador = { id: u.ID, nome: (u.NAME || '') + ' ' + (u.LAST_NAME || '') };
        }
        carregarMensagens();
      });

      try { if (typeof BX24.fitWindow === 'function') BX24.fitWindow(); } catch (e) {}
    });
  }

  if (window.BX24) {
    iniciar();
  } else {
    setSimpleState('err', 'Não foi possível carregar o Bitrix24', 'Recarregue e tente novamente.');
  }
</script>

</body>
</html>
`);
}
