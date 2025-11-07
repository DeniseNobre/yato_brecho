const { Client } = require('pg');

exports.handler = async (event) => {
  const { ids } = JSON.parse(event.body);

  // Validação básica
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => !isNaN(parseInt(id)))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'erro', mensagem: 'IDs inválidos ou ausentes' })
    };
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Monta placeholders seguros: $1, $2, ...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const query = `DELETE FROM produtos WHERE id IN (${placeholders})`;

    const resultado = await client.query(query, ids.map(id => parseInt(id)));
    console.log("Produtos excluídos:", resultado.rowCount);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'excluido', removidos: resultado.rowCount })
    };
  } catch (error) {
    console.error('Erro ao excluir produtos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'erro', mensagem: 'Erro interno: ' + error.message })
    };
  } finally {
    await client.end();
  }
};