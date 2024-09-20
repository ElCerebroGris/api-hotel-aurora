const express = require('express');
const router = express.Router();
const db = require('../database');

// Fazer reserva
router.post('/', (req, res) => {
    const { utilizador_id, quarto_id, checkin_date, checkout_date } = req.body;
    const confirmacao = Math.random().toString(36).substr(2, 9);
    db.run(`INSERT INTO reservas (utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao)
            VALUES (?, ?, ?, ?, ?)`, [utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ confirmacao });
        }
    });
});

// Gerir reservas (listar todas)
router.get('/', (req, res) => {
    db.all('SELECT * FROM reservas', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;
