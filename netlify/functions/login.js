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

  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const resultado = await client.query(
      'SELECT tipo_usuario FROM usuarios WHERE nome = $1 AND senha = $2',
      [nome, senha]
    );

    await client.end();

    if (resultado.rows.length > 0) {
      const tipo = resultado.rows[0].tipo_usuario;
      return {
        statusCode: 200,
        body: JSON.stringify({
          sucesso: true,
          mensagem: 'Login válido',
          tipo_usuario: tipo,
          nome: nome //nome incluído na resposta
        })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({
          sucesso: false,
          mensagem: 'Nome ou senha inválidos'
        })
      };
    }
  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        sucesso: false,
        mensagem: 'Erro interno',
        erro: erro.message
      })
    };
  }
};