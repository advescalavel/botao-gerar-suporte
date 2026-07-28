export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chamado técnico — Sofia</title>
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
  html, body {
    margin: 0;
    height: 100%;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  body {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }
  .header {
    background: var(--primary);
    color: #fff;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }
  .header h1 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.2px;
  }
  .header span {
    display: block;
    font-size: 11px;
    color: rgba(255,255,255,0.65);
    margin-top: 2px;
    font-weight: 400;
  }
  .body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 24px;
  }
  .panel {
    width: 100%;
    max-width: 320px;
    text-align: center;
  }
  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 22px;
    font-weight: 600;
  }
  .icon.loading { background: #ffe6f5; color: var(--accent); }
  .icon.ok { background: var(--ok-bg); color: var(--ok); }
  .icon.err { background: var(--err-bg); color: var(--err); }
  .icon.warn { background: var(--warn-bg); color: var(--warn); }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2.5px solid #ffd0ec;
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; border-top-color: #ffd0ec; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  h2 {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 6px;
    color: var(--primary);
  }
  p.detail {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }
  .meta {
    margin-top: 16px;
    font-size: 11.5px;
    color: var(--text-muted);
    border-top: 1px solid var(--border);
    padding-top: 12px;
    text-align: left;
  }
  .meta div { margin-bottom: 3px; }
  .debug {
    margin-top: 14px;
    font-size: 10.5px;
    color: #9a4a6b;
    background: #fff5fa;
    border: 1px solid #ffd6ec;
    border-radius: 6px;
    padding: 8px 10px;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
    display: none;
  }
  button {
    margin-top: 18px;
    padding: 9px 16px;
    font-size: 12.5px;
    font-weight: 600;
    border-radius: 7px;
    border: 1.5px solid var(--accent);
    background: #fff;
    color: var(--accent);
    cursor: pointer;
    font-family: inherit;
  }
  button:hover { background: #fff0f8; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
</head>
<body>

  <div class="header">
    <div class="dot"></div>
    <div>
      <h1>Advocacia Escalável</h1>
      <span>Chamado técnico via Sofia</span>
    </div>
  </div>

  <div class="body">
    <div class="panel">
      <div id="icon" class="icon loading"><div class="spinner"></div></div>
      <h2 id="title">Registrando chamado…</h2>
      <p class="detail" id="detail">Coletando informações do atendimento.</p>
      <div class="meta" id="meta" style="display:none;"></div>
      <div class="debug" id="debug"></div>
      <button id="retryBtn" style="display:none;" onclick="enviar()">Tentar novamente</button>
    </div>
  </div>

<script>
  // ---- CONFIGURAÇÃO ----
  var N8N_WEBHOOK_URL = 'https://webhook.prod.advocaciaescalaveldev.shop/webhook/sofia-suporte';
  // -----------------------

  var contexto = { dialogId: null, chatId: null, colaborador: null, portal: null };

  window.onerror = function (msg, src, line, col, err) {
    showDebug('Erro JS: ' + msg + ' (linha ' + line + ')');
    return false;
  };

  function showDebug(text) {
    var el = document.getElementById('debug');
    el.style.display = 'block';
    el.textContent = text;
  }

  function setState(state, titleText, detailText) {
    var icon = document.getElementById('icon');
    var title = document.getElementById('title');
    var detail = document.getElementById('detail');
    var retry = document.getElementById('retryBtn');

    icon.className = 'icon ' + state;
    title.textContent = titleText;
    detail.textContent = detailText;

    if (state === 'loading') {
      icon.innerHTML = '<div class="spinner"></div>';
      retry.style.display = 'none';
    } else if (state === 'ok') {
      icon.innerHTML = '✓';
      retry.style.display = 'none';
    } else if (state === 'err') {
      icon.innerHTML = '!';
      retry.style.display = 'inline-block';
    } else if (state === 'warn') {
      icon.innerHTML = '!';
      retry.style.display = 'none';
    }
  }

  function showMeta() {
    if (!contexto.dialogId) return;
    var meta = document.getElementById('meta');
    meta.style.display = 'block';
    meta.innerHTML =
      '<div>Chat: ' + contexto.dialogId + '</div>' +
      (contexto.colaborador ? '<div>Colaborador: ' + contexto.colaborador.nome + '</div>' : '') +
      (contexto.mensagensCount !== undefined ? '<div>Mensagens capturadas: ' + contexto.mensagensCount + '</div>' : '');
  }

  function buscarHistorico(callback) {
    if (!contexto.chatId) { callback([]); return; }

    BX24.callMethod(
      'imopenlines.session.history.get',
      { CHAT_ID: contexto.chatId },
      function (result) {
        if (result.error()) {
          showDebug('Histórico indisponível: ' + JSON.stringify(result.error()));
          callback([]);
          return;
        }

        var data = result.data();
        var msgs = data.message || {};
        var users = data.users || {};

        var lista = Object.keys(msgs).map(function (id) {
          var m = msgs[id];
          var autor = users[m.senderid];
          return {
            id: parseInt(id, 10),
            remetente: autor ? autor.name : ('usuário ' + m.senderid),
            texto: m.textlegacy || m.text,
            data: m.date
          };
        });

        lista.sort(function (a, b) { return a.id - b.id; });
        callback(lista);
      }
    );
  }

  function enviar() {
    if (!contexto.dialogId) {
      setState('warn', 'Não foi possível identificar o atendimento',
        'Abra este botão dentro de um chat de Open Line em andamento.');
      return;
    }

    setState('loading', 'Registrando chamado…', 'Coletando o histórico da conversa.');

    buscarHistorico(function (mensagens) {
      contexto.mensagensCount = mensagens.length;

      var payload = {
        dialog_id: contexto.dialogId,
        chat_id: contexto.chatId,
        colaborador: contexto.colaborador,
        portal: contexto.portal,
        origem: 'bitrix24_contact_center_botao',
        timestamp: new Date().toISOString(),
        mensagens: mensagens
      };

      setState('loading', 'Enviando para a Sofia…', 'Transmitindo ' + mensagens.length + ' mensagem(ns) da sessão.');

      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          setState('ok', 'Chamado registrado', 'A equipe técnica já tem acesso ao contexto completo deste atendimento.');
          showMeta();
        })
        .catch(function (err) {
          setState('err', 'Falha ao registrar', 'Não foi possível falar com a Sofia agora.');
          showDebug('Erro no fetch: ' + err.message + ' — se for "Failed to fetch", provavelmente é CORS no webhook n8n (falta Access-Control-Allow-Origin liberando este domínio).');
          showMeta();
        });
    });
  }

  function iniciar() {
    BX24.init(function () {
      var info = {};
      try {
        info = BX24.placement.info() || {};
      } catch (e) {}

      var options = info.options || {};
      contexto.dialogId = options.dialogId || null;
      contexto.chatId = contexto.dialogId ? contexto.dialogId.replace(/^chat/, '') : null;

      var auth = BX24.getAuth ? BX24.getAuth() : null;
      contexto.portal = auth ? auth.domain : null;

      BX24.callMethod('user.current', {}, function (result) {
        if (!result.error()) {
          var u = result.data();
          contexto.colaborador = {
            id: u.ID,
            nome: (u.NAME || '') + ' ' + (u.LAST_NAME || '')
          };
        }
        enviar();
      });

      try { if (typeof BX24.fitWindow === 'function') BX24.fitWindow(); } catch (e) {}
    });
  }

  if (window.BX24) {
    iniciar();
  } else {
    setState('err', 'Não foi possível carregar o Bitrix24', 'Recarregue e tente novamente.');
  }
</script>

</body>
</html>
`);
}
