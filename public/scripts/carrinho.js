document.addEventListener('DOMContentLoaded', () => {
  const listaCarrinho = document.getElementById('listaCarrinho');
  const totalCarrinho = document.getElementById('totalCarrinho');

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  function atualizarCarrinho() {
    listaCarrinho.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
      listaCarrinho.innerHTML = '<p class="vazio">Seu carrinho está vazio.</p>';
      totalCarrinho.textContent = 'R$ 0,00';
      return;
    }

    carrinho.forEach((item, index) => {
      total += parseFloat(item.preco);

      const div = document.createElement('div');
      div.classList.add('item-carrinho');
      div.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}" />
        <div>
          <h2>${item.nome}</h2>
          <p>R$ ${parseFloat(item.preco).toFixed(2)}</p>
          <button data-index="${index}" class="remover-item">Remover</button>
        </div>
      `;
      listaCarrinho.appendChild(div);
    });

    totalCarrinho.textContent = `R$ ${total.toFixed(2)}`;
  }

  listaCarrinho.addEventListener('click', (e) => {
    if (e.target.classList.contains('remover-item')) {
      const index = e.target.dataset.index;
      carrinho.splice(index, 1);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      atualizarCarrinho();
    }
  });

  document.getElementById('finalizarCompra').addEventListener('click', async () => {
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    let usuario;
    try {
      usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    } catch {
      usuario = { nome: 'Visitante' };
    }

    const pedido = {
      cliente: usuario?.nome || 'Visitante',
      itens: carrinho
    };

    try {
      const resposta = await fetch('/.netlify/functions/registrarPedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });

      if (resposta.ok) {
        alert('Compra finalizada com sucesso!');
        carrinho = [];
        localStorage.removeItem('carrinho');
        atualizarCarrinho();
      } else {
        alert('Erro ao registrar pedido. Tente novamente.');
      }
    } catch (erro) {
      console.error('Erro ao enviar pedido:', erro);
      alert('Erro ao registrar pedido. Verifique sua conexão.');
    }
  });

  atualizarCarrinho();
});