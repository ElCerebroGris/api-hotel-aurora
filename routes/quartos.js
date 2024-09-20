const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar todos os quartos
router.get('/', (req, res) => {
    db.all('SELECT * FROM quartos', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Adicionar quarto
router.post('/', (req, res) => {
    const { tipo, comodidades, preco } = req.body;
    db.run('INSERT INTO quartos (tipo, comodidades, preco) VALUES (?, ?, ?)', [tipo, comodidades, preco], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID });
        }
    });
});

module.exports = router;
