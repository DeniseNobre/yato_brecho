const { Client } = require('pg');

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const resultado = await client.query(`
      SELECT id, nome, preco, estoque, categoria, tamanho, condicao, imagem
      FROM produtos
      ORDER BY id DESC
    `);

    console.log("Produtos listados:", resultado.rowCount);

    return {
      statusCode: 200,
      body: JSON.stringify(resultado.rows)
    };
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'erro', mensagem: 'Erro interno: ' + error.message })
    };
  } finally {
    await client.end();
  }
};