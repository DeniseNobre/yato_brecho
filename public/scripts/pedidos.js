document.addEventListener('DOMContentLoaded', async () => {
  const lista = document.getElementById('listaPedidos');

  try {
    const resposta = await fetch('/.netlify/functions/listarPedidos');
    const pedidos = await resposta.json();

    if (pedidos.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhum pedido registrado.</p>';
      return;
    }

    pedidos.forEach(pedido => {
      const div = document.createElement('div');
      div.classList.add('pedido');

      const itensHTML = pedido.itens.map(item =>
        `<li>${item.nome} — R$ ${parseFloat(item.preco).toFixed(2)}</li>`
      ).join('');

      div.innerHTML = `
        <h2>Pedido #${pedido.id}</h2>
        <p><strong>Cliente:</strong> ${pedido.cliente}</p>
        <p><strong>Status:</strong> <span class="status-text">${pedido.status || 'pendente'}</span></p>
        <ul>${itensHTML}</ul>
        <div class="acoes">
          <label for="status-${pedido.id}">Atualizar status:</label>
          <select id="status-${pedido.id}" class="atualizar-status" data-id="${pedido.id}">
            <option value="pendente">Pendente</option>
            <option value="em preparo">Em preparo</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
          </select>
          <button class="remover-pedido" data-id="${pedido.id}">Remover</button>
        </div>
      `;

      lista.appendChild(div);

      // Define o status atual no select
      const select = div.querySelector('.atualizar-status');
      select.value = pedido.status || 'pendente';

      // Atualiza o status no banco
      select.addEventListener('change', async (e) => {
        const novoStatus = e.target.value;
        div.querySelector('.status-text').textContent = novoStatus;

        try {
          await fetch('/.netlify/functions/listarPedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'atualizar', id: pedido.id, status: novoStatus })
          });
        } catch (erro) {
          alert('Erro ao atualizar status.');
        }
      });

      // Remove o pedido da tela e do banco
      div.querySelector('.remover-pedido').addEventListener('click', async () => {
        try {
          const resposta = await fetch('/.netlify/functions/listarPedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'excluir', id: pedido.id })
          });

          const resultado = await resposta.json();

          if (resultado.sucesso) {
            div.remove();
          } else {
            alert('Erro ao remover pedido: ' + resultado.mensagem);
          }
        } catch (erro) {
          alert('Erro de conexão ao tentar remover pedido.');
        }
      });
    });
  } catch (erro) {
    lista.innerHTML = '<p class="erro">Erro ao carregar pedidos.</p>';
    console.error('Erro ao buscar pedidos:', erro);
  }
});