const express = require('express');
const router = express.Router();
const db = require('../database');

// Listar todos os funcionários
router.get('/', (req, res) => {
    db.all('SELECT * FROM funcionarios', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Adicionar funcionário
router.post('/', (req, res) => {
    const { nome, cargo } = req.body;
    db.run('INSERT INTO funcionarios (nome, cargo) VALUES (?, ?)', [nome, cargo], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID });
        }
    });
});

module.exports = router;
