const express = require('express');
const router = express.Router();
const db = require('../database');

// Registrar utilizador
router.post('/', (req, res) => {
    const { nome, email, telefone } = req.body;
    db.run('INSERT INTO utilizadores (nome, email, telefone) VALUES (?, ?, ?)', [nome, email, telefone], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID });
        }
    });
});

module.exports = router;
