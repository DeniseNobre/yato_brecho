require('dotenv').config();
const { Client } = require('pg');

exports.handler = async (event) => {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    if (event.httpMethod === 'GET') {
      // Listar pedidos
      const resultado = await client.query('SELECT * FROM pedidos ORDER BY id DESC');
      await client.end();

      return {
        statusCode: 200,
        body: JSON.stringify(resultado.rows)
      };
    }

    if (event.httpMethod === 'POST') {
      // Excluir pedido
      const { id } = JSON.parse(event.body);

      await client.query('DELETE FROM pedidos WHERE id = $1', [id]);
      await client.end();

      return {
        statusCode: 200,
        body: JSON.stringify({ sucesso: true, mensagem: 'Pedido removido com sucesso.' })
      };
    }

    // Método não permitido
    await client.end();
    return {
      statusCode: 405,
      body: 'Método não permitido'
    };
  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({ sucesso: false, mensagem: 'Erro interno', erro: erro.message })
    };
  }
};