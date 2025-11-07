const { Client } = require('pg');

exports.handler = async (event) => {
  const { nome, preco, estoque, categoria, tamanho, condicao, imagem } = JSON.parse(event.body);

  // Validação básica dos dados
  const categoriasValidas = ['Feminino', 'Masculino', 'Infantil', 'Casa&Decor', 'Outros'];
  const condicoesValidas = ['Novo', 'Seminovo', 'Vintage'];

  if (
    !nome || typeof nome !== 'string' || nome.trim() === '' ||
    isNaN(preco) || preco <= 0 ||
    isNaN(estoque) || estoque < 0 ||
    !categoria || typeof categoria !== 'string' || !categoriasValidas.includes(categoria.trim()) ||
    typeof tamanho !== 'string' || tamanho.trim() === '' ||
    !condicao || !condicoesValidas.includes(condicao) ||
    typeof imagem !== 'string' || imagem.trim() === ''
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

  try {
    await client.connect();
    await client.query(
      `INSERT INTO produtos (nome, preco, estoque, categoria, tamanho, condicao, imagem)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nome.trim(), preco, estoque, categoria.trim(), tamanho.trim(), condicao, imagem.trim()]
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok' })
    };
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'erro', mensagem: error.message })
    };
  } finally {
    await client.end();
  }
};