const express = require("express");
const router = express.Router();
const db = require("../database");

// Listar todos os serviços
router.get('/', (req, res) => {
    db.all('SELECT * FROM servicos', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Adicionar funcionário
router.post('/', (req, res) => {
    const { descricao, preco } = req.body;
    db.run('INSERT INTO servicos (descricao, preco) VALUES (?, ?)', [descricao, preco], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID });
        }
    });
});

module.exports = router;
