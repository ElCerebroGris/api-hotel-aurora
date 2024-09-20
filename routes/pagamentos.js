const express = require('express');
const router = express.Router();
const db = require('../database');

// Realizar pagamento
router.post('/', (req, res) => {
    const { reserva_id, valor, metodo_pagamento } = req.body;
    const status = 'Pago';
    db.run(`INSERT INTO pagamentos (reserva_id, valor, metodo_pagamento, status)
            VALUES (?, ?, ?, ?)`, [reserva_id, valor, metodo_pagamento, status], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ status: 'Pagamento realizado com sucesso' });
        }
    });
});

module.exports = router;
