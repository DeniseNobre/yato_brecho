require('dotenv').config();
const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido',
    };
  }

  const { acao, nome, senha, foto_url } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    if (acao === 'login') {
      const resultado = await client.query(
        'SELECT tipo_usuario FROM usuarios WHERE nome = $1 AND senha = $2',
        [nome, senha]
      );

      if (resultado.rows.length > 0) {
        const tipo = resultado.rows[0].tipo_usuario;
        return {
          statusCode: 200,
          body: JSON.stringify({
            sucesso: true,
            mensagem: 'Login válido',
            tipo_usuario: tipo,
            nome: nome
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
    }

    if (acao === 'buscar') {
      const resultado = await client.query(
        'SELECT nome, senha, foto_url FROM usuarios WHERE nome = $1',
        [nome]
      );

      if (resultado.rows.length > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            sucesso: true,
            dados: resultado.rows[0]
          })
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            sucesso: false,
            mensagem: 'Cliente não encontrado'
          })
        };
      }
    }

    if (acao === 'atualizar') {
      await client.query(
        'UPDATE usuarios SET nome = $1, senha = $2, foto_url = $3 WHERE nome = $1',
        [nome, senha, foto_url]
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          sucesso: true,
          mensagem: 'Dados atualizados com sucesso'
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        sucesso: false,
        mensagem: 'Ação inválida'
      })
    };
  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        sucesso: false,
        mensagem: 'Erro interno',
        erro: erro.message
      })
    };
  } finally {
    await client.end();
  }
};