let todosProdutos = [];

// Exibe os produtos no catálogo
function exibirProdutos(lista) {
  const catalogo = document.querySelector('.catalogo');
  catalogo.innerHTML = '';

  if (!lista || lista.length === 0) {
    catalogo.innerHTML = '<p class="vazio">Nenhum produto encontrado.</p>';
    return;
  }

  lista.forEach((p, index) => {
    p.id = p.id || index; // Garante que cada produto tenha um ID

    const item = document.createElement('div');
    item.classList.add('produto');

    item.innerHTML = `
      <img src="${p.imagem || 'https://via.placeholder.com/300x200'}" alt="${p.nome}" class="produto-imagem">
      <h2 class="produto-nome">${p.nome}</h2>
      ${p.tamanho ? `<p class="produto-tamanho">Tamanho: ${p.tamanho}</p>` : ''}
      <p class="produto-preco">R$ ${parseFloat(p.preco).toFixed(2)}</p>
      <p class="produto-categoria">${p.categoria}</p>
      <button class="produto-comprar" data-id="${p.id}">Adicionar ao carrinho</button>
    `;

    catalogo.appendChild(item);
  });

  // Evento para adicionar ao carrinho
  document.querySelectorAll('.produto-comprar').forEach(botao => {
    botao.addEventListener('click', () => {
      const id = botao.dataset.id;
      const produto = todosProdutos.find(p => p.id == id);

      let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
      carrinho.push(produto);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));

      alert(`${produto.nome} foi adicionado ao carrinho!`);
    });
  });
}

// Aplica filtros combinados + pesquisa
function aplicarFiltros() {
  const termo = document.getElementById('pesquisa').value.toLowerCase();

  const filtros = {
    tamanho: [],
    preco: [],
    condicao: []
  };

  document.querySelectorAll('#lista-filtros input:checked').forEach(i => {
    const tipo = i.dataset.filtro;
    filtros[tipo].push(i.value.toLowerCase());
  });

  const filtrados = todosProdutos.filter(p => {
    const matchNome = p.nome.toLowerCase().includes(termo);

    const matchTamanho = filtros.tamanho.length === 0 || filtros.tamanho.includes(p.tamanho?.toLowerCase());
    const matchCondicao = filtros.condicao.length === 0 || filtros.condicao.includes(p.condicao?.toLowerCase());
    const matchPreco = filtros.preco.length === 0 || (
      filtros.preco.includes('ate50') && p.preco <= 50 ||
      filtros.preco.includes('50a100') && p.preco > 50 && p.preco <= 100 ||
      filtros.preco.includes('acima100') && p.preco > 100
    );

    return matchNome && matchTamanho && matchCondicao && matchPreco;
  });

  exibirProdutos(filtrados);
}

// Carrega os produtos ao iniciar
async function carregarCatalogo() {
  try {
    const res = await fetch('/.netlify/functions/listarProdutos');
    todosProdutos = await res.json();
    exibirProdutos(todosProdutos);
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro);
  }
}

// Inicializa tudo após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  carregarCatalogo();

  // Eventos de pesquisa
  document.getElementById('pesquisa').addEventListener('input', aplicarFiltros);

  // Mostrar/ocultar filtros
  document.getElementById('botao-filtro').addEventListener('click', () => {
    document.getElementById('lista-filtros').classList.toggle('ativo');
  });

  // Eventos dos filtros
  document.querySelectorAll('#lista-filtros input').forEach(input => {
    input.addEventListener('change', aplicarFiltros);
  });

  // Menu de categorias
  document.querySelectorAll('.menu-categorias a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoria = link.dataset.categoria.toLowerCase();

      const filtrados = todosProdutos.filter(p =>
        p.categoria?.toLowerCase() === categoria
      );

      // Limpa pesquisa e filtros ao clicar no menu
      document.getElementById('pesquisa').value = '';
      document.querySelectorAll('#lista-filtros input').forEach(i => i.checked = false);

      exibirProdutos(filtrados);
    });
  });
});