/*jshint esversion: 6 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');

const app = express();

// Parametros de conexão com o banco
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'family_silva',
  password: '123456',
  port: '5432'
});

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Roda para carregar produtos
app.get('/', function (req, res) {
  pool.connect(function (err, client, done) {
    // Checa a conexão
    if (err) {
      return console.error('Erro na conexão com o DB', err);
    }
    // Query para selecionar todos os produtos do banco ordenados pelo ID
    client.query('SELECT * FROM shopping_list ORDER BY id', function (err, result) {
      if (err) {
        return console.error('Erro durante a execução da consulta (Query).', err);
      }
      res.render('index', { products: result.rows });
      done();
    });
  });
});

// Rota para adicionar produto
app.post('/add', function (req, res) {
  const product = req.body;
  pool.connect(function (err, client, done) {
    // Checa a conexão
    if (err) {
      return console.error('Erro na conexão com o DB', err);
    }
    // Insere um novo produto no banco
    client.query('INSERT INTO shopping_list (name, amount, obs) VALUES ($1, $2, $3)', [product.name, product.amount, product.obs]);
    done();
    // Recarrega a página
    res.redirect('/');
  });
});

// Rota para editar produto
app.post('/edit', function (req, res) {
  const product = req.body;
  pool.connect(function (err, client, done) {
    // Checa a conexão
    if (err) {
      return console.error('Erro na conexão com o DB', err);
    }
    // Atualiza o produto de acordo com o ID
    client.query('UPDATE shopping_list SET name = $2, amount = $3, obs = $4 WHERE id = $1', [product.id, product.name, product.amount, product.obs]);
    done();
    // Recarrega a página
    res.redirect('/');
  });
});

// Rota para deletar produto
app.delete('/delete/:id', function (req, res) {
  const id = Number(req.params.id);
  pool.connect(function (err, client, done) {
    // Rota para adicionar produto
    if (err) {
      return console.error('Erro na conexão com o DB', err);
    }
    // Deleta o produto pelo ID
    client.query('DELETE FROM shopping_list WHERE id = $1', [id]);
    res.sendStatus(200);
  });
});

// Porta para rodar a aplicação web
app.listen(3000, function () {
  console.log('Servidor aberto na porta 3000');
});