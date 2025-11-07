const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido'
    };
  }

  try {
    const pedido = JSON.parse(event.body);
    const { cliente, itens } = pedido;

    if (!cliente || !Array.isArray(itens) || itens.length === 0) {
      return {
        statusCode: 400,
        body: 'Pedido inválido'
      };
    }

    const client = await pool.connect();

    const result = await client.query(
      'INSERT INTO pedidos (cliente, itens) VALUES ($1, $2) RETURNING id',
      [cliente, JSON.stringify(itens)]
    );

    client.release();

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensagem: 'Pedido registrado com sucesso',
        id: result.rows[0].id
      })
    };
  } catch (erro) {
    console.error('Erro ao registrar pedido:', erro);
    return {
      statusCode: 500,
      body: 'Erro ao registrar pedido'
    };
  }
};