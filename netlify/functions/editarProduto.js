const { Client } = require('pg');

exports.handler = async (event) => {
  try {
    const dados = JSON.parse(event.body);
    console.log("Recebido:", dados);

    const { id, nome, preco, estoque, categoria, tamanho, condicao, imagem } = dados;

    // Validação básica dos dados
    const categoriasValidas = ['Feminino', 'Masculino', 'Infantil', 'Casa&Decor', 'Outros'];
    const condicoesValidas = ['Novo', 'Seminovo', 'Vintage'];

    if (
      !id || isNaN(parseInt(id)) ||
      !nome || typeof nome !== 'string' || nome.trim() === '' ||
      !categoria || typeof categoria !== 'string' || !categoriasValidas.includes(categoria.trim()) ||
      typeof tamanho !== 'string' || tamanho.trim() === '' ||
      !condicao || !condicoesValidas.includes(condicao) ||
      typeof imagem !== 'string' || imagem.trim() === '' ||
      isNaN(preco) || preco <= 0 ||
      isNaN(estoque) || estoque < 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: 'erro', mensagem: 'Dados inválidos ou incompletos' })
      };
    }

    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const resultado = await client.query(
      `UPDATE produtos
       SET nome = $1, preco = $2, estoque = $3, categoria = $4, tamanho = $5, condicao = $6, imagem = $7
       WHERE id = $8`,
      [nome.trim(), preco, estoque, categoria.trim(), tamanho.trim(), condicao, imagem.trim(), parseInt(id)]
    );

    console.log("Linhas afetadas:", resultado.rowCount);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'atualizado' })
    };
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'erro', mensagem: 'Erro interno: ' + error.message })
    };
  }
};