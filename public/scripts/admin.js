async function carregarProdutos() {
  const res = await fetch('/.netlify/functions/listarProdutos');
  const produtos = await res.json();
  const tabela = document.getElementById('tabela-produtos');
  tabela.innerHTML = '';

  if (produtos.length === 0) {
    tabela.innerHTML = `<tr><td colspan="10" class="center">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  produtos.forEach(p => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${p.id}</td>
      <td class="center"><input type="checkbox" name="selecionado" value="${p.id}"></td>
      <td><img src="${p.imagem}" alt="${p.nome}" width="50"></td>
      <td class="nome">${p.nome}</td>
      <td class="tamanho">${p.tamanho}</td>
      <td class="preco">R$${parseFloat(p.preco).toFixed(2)}</td>
      <td class="estoque">${p.estoque}</td>
      <td class="categoria">${p.categoria}</td>
      <td class="condicao">${p.condicao}</td>
      <td class="center">
        <button onclick="editarProduto(${p.id})">Editar</button>
      </td>
    `;
    tabela.appendChild(linha);
  });
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const preco = parseFloat(document.getElementById('preco').value);
  const estoque = parseInt(document.getElementById('estoque').value);
  const categoria = document.getElementById('categoria').value || 'Outros';
  const tamanho = document.getElementById('tamanho').value.trim() || 'N/A';
  const condicao = document.getElementById('condicao').value;
  const imagemInput = document.getElementById('imagem');
  const arquivo = imagemInput.files[0];

  if (!arquivo) {
    alert('Selecione uma imagem.');
    return;
  }

  const formData = new FormData();
  formData.append('image', arquivo);

  try {
    const upload = await fetch('https://api.imgbb.com/1/upload?key=b9ec0c76e3385dbca149da55564677fe', {
      method: 'POST',
      body: formData
    });

    const resultadoUpload = await upload.json();
    const imagemURL = resultadoUpload.data.url;

    const res = await fetch('/.netlify/functions/adicionarProduto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, preco, estoque, categoria, tamanho, condicao, imagem: imagemURL })
    });

    const resultado = await res.json();
    if (resultado.status === 'ok') {
      alert('Produto cadastrado!');
      e.target.reset();
      carregarProdutos();
    } else {
      alert('Erro ao cadastrar produto.');
    }
  } catch (err) {
    alert('Erro ao enviar imagem ou cadastrar produto: ' + err.message);
  }
});

document.getElementById('excluir-selecionados').addEventListener('click', async () => {
  const selecionados = Array.from(document.querySelectorAll('input[name="selecionado"]:checked'))
    .map(input => input.value);

  if (selecionados.length === 0) {
    alert('Nenhum produto selecionado.');
    return;
  }

  const res = await fetch('/.netlify/functions/excluirProduto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: selecionados })
  });

  const resultado = await res.json();
  if (resultado.status === 'excluido') {
    alert('Produtos excluídos!');
    carregarProdutos();
  } else {
    alert('Erro ao excluir.');
  }
});

window.editarProduto = function(id) {
  const linha = [...document.querySelectorAll('#tabela-produtos tr')]
    .find(tr => tr.querySelector(`input[value="${id}"]`));

  const imagemCelula = linha.querySelector('td:nth-child(3)');
  const nomeCelula = linha.querySelector('.nome');
  const tamanhoCelula = linha.querySelector('.tamanho');
  const precoCelula = linha.querySelector('.preco');
  const estoqueCelula = linha.querySelector('.estoque');
  const categoriaCelula = linha.querySelector('.categoria');
  const condicaoCelula = linha.querySelector('.condicao');
  const botaoCelula = linha.querySelector('td:last-child');

  const nomeAtual = nomeCelula.textContent;
  const tamanhoAtual = tamanhoCelula.textContent;
  const precoAtual = precoCelula.textContent.replace('R$', '').replace(',', '.');
  const estoqueAtual = estoqueCelula.textContent;
  const categoriaAtual = categoriaCelula.textContent;
  const condicaoAtual = condicaoCelula.textContent;
  const imagemAtualSrc = imagemCelula.querySelector('img')?.src || '';

  imagemCelula.innerHTML = `<input type="file" accept="image/*" data-src="${imagemAtualSrc}">`;
  nomeCelula.innerHTML = `<input type="text" value="${nomeAtual}">`;
  tamanhoCelula.innerHTML = `
    <input list="tamanhos-edicao" value="${tamanhoAtual}" autocomplete="off">
    <datalist id="tamanhos-edicao">
      <option value="Único">
      <option value="N/A">
      <option value="PP">
      <option value="P">
      <option value="M">
      <option value="G">
      <option value="GG">
    </datalist>
  `;
  precoCelula.innerHTML = `<input type="number" step="0.01" value="${parseFloat(precoAtual)}">`;
  estoqueCelula.innerHTML = `<input type="number" min="0" value="${estoqueAtual}">`;
  categoriaCelula.innerHTML = `
    <select>
      <option value="Feminino" ${categoriaAtual === 'Feminino' ? 'selected' : ''}>Feminino</option>
      <option value="Masculino" ${categoriaAtual === 'Masculino' ? 'selected' : ''}>Masculino</option>
      <option value="Infantil" ${categoriaAtual === 'Infantil' ? 'selected' : ''}>Infantil</option>
      <option value="Casa&Decor" ${categoriaAtual === 'Casa&Decor' ? 'selected' : ''}>Casa&Decor</option>
      <option value="Outros" ${categoriaAtual === 'Outros' ? 'selected' : ''}>Outros</option>
    </select>
  `;
  condicaoCelula.innerHTML = `
    <select>
      <option value="Novo" ${condicaoAtual === 'Novo' ? 'selected' : ''}>Novo</option>
      <option value="Seminovo" ${condicaoAtual === 'Seminovo' ? 'selected' : ''}>Seminovo</option>
      <option value="Vintage" ${condicaoAtual === 'Vintage' ? 'selected' : ''}>Vintage</option>
    </select>
  `;

  botaoCelula.innerHTML = `
    <button onclick="salvarProduto(${id})">Salvar</button>
    <button onclick="carregarProdutos()">Cancelar</button>
  `;
};

window.salvarProduto = async function(id) {
  const linha = [...document.querySelectorAll('#tabela-produtos tr')]
    .find(tr => tr.querySelector(`input[value="${id}"]`));

  const imagemInput = linha.querySelector('td:nth-child(3) input');
  const arquivo = imagemInput.files[0];

  let imagemURL = '';

  if (arquivo) {
    const formData = new FormData();
    formData.append('image', arquivo);

    try {
      const upload = await fetch('https://api.imgbb.com/1/upload?key=b9ec0c76e3385dbca149da55564677fe', {
        method: 'POST',
        body: formData
      });

      const resultadoUpload = await upload.json();
      imagemURL = resultadoUpload.data.url;
    } catch (err) {
      alert('Erro ao enviar nova imagem: ' + err.message);
      return;
    }
  } else {
    imagemURL = imagemInput.getAttribute('data-src') || '';
  }

  const nome = linha.querySelector('.nome input').value.trim();
  const tamanho = linha.querySelector('.tamanho input').value.trim() || 'N/A';
  const preco = parseFloat(linha.querySelector('.preco input').value);
  const estoque = parseInt(linha.querySelector('.estoque input').value);
  const categoria = linha.querySelector('.categoria select').value;
  const condicao = linha.querySelector('.condicao select').value;

  const res = await fetch('/.netlify/functions/editarProduto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: parseInt(id),
      nome,
      preco,
      estoque,
      categoria,
      tamanho,
      condicao,
      imagem: imagemURL
    })
  });

  const resultado = await res.json();
  if (resultado.status === 'atualizado') {
    alert('Produto atualizado!');
    carregarProdutos();
  } else {
    alert('Erro ao atualizar.');
  }
};

carregarProdutos();