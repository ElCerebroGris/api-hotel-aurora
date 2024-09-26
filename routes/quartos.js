const express = require("express");
const router = express.Router();
const db = require("../database");

// Listar todos os quartos
router.get("/", (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Data de hoje no formato 'YYYY-MM-DD'

  // Query para selecionar todos os quartos com verificação da ocupação na data de hoje
  const query = `
        SELECT q.id, q.comodidades, q.tipo, q.descricao, q.preco,
               CASE
                   WHEN EXISTS (
                       SELECT 1
                       FROM reservas r
                       WHERE r.quarto_id = q.id
                       AND r.checkin_date <= ? 
                       AND r.checkout_date >= ?
                   ) THEN 'ocupado'
                   ELSE 'vazio'
               END AS situacao
        FROM quartos q
    `;

  db.all(query, [today, today], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Adicionar quarto
router.post("/", (req, res) => {
  const { tipo, descricao, comodidades, preco } = req.body;
  db.run(
    "INSERT INTO quartos (tipo, descricao, comodidades, preco) VALUES (?, ?, ?, ?)",
    [tipo, comodidades, preco],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).send({ id: this.lastID });
      }
    }
  );
});

module.exports = router;
