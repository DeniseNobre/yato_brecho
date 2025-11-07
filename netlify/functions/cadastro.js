require('dotenv').config();
const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido',
    };
  }

  const { nome, senha } = JSON.parse(event.body);

  if (!nome || !senha) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        sucesso: false,
        mensagem: 'Nome e senha são obrigatórios.'
      })
    };
  }

  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Verifica se o nome já existe
    const existe = await client.query(
      'SELECT nome FROM usuarios WHERE nome = $1',
      [nome]
    );

    if (existe.rows.length > 0) {
      await client.end();
      return {
        statusCode: 409,
        body: JSON.stringify({
          sucesso: false,
          mensagem: 'Usuário já cadastrado.'
        })
      };
    }

    // Insere novo usuário como cliente
    await client.query(
      'INSERT INTO usuarios (nome, senha, tipo_usuario) VALUES ($1, $2, $3)',
      [nome, senha, 'cliente']
    );

    await client.end();

    return {
      statusCode: 201,
      body: JSON.stringify({
        sucesso: true,
        mensagem: 'Cadastro realizado com sucesso!'
      })
    };
  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        sucesso: false,
        mensagem: 'Erro interno no servidor.',
        erro: erro.message
      })
    };
  }
};