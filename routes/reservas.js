const express = require('express');
const router = express.Router();
const db = require('../database');

// Fazer reserva
router.post('/', (req, res) => {
    const { utilizador_id, quarto_id, checkin_date, checkout_date } = req.body;

    // Verifica se a data de checkout é posterior à data de checkin
    const checkin = new Date(checkin_date);
    const checkout = new Date(checkout_date);

    if (checkout <= checkin) {
        return res.status(400).send('A data de checkout deve ser posterior à data de checkin.');
    }

    // Verifica se o quarto já está reservado para as datas fornecidas
    db.get(`SELECT * FROM reservas WHERE quarto_id = ? 
            AND ((checkin_date <= ? AND checkout_date >= ?) 
            OR (checkin_date <= ? AND checkout_date >= ?))`,
        [quarto_id, checkin_date, checkin_date, checkout_date, checkout_date],
        (err, row) => {
            if (err) {
                res.status(500).send(err.message);
            } else if (row) {
                res.status(400).send('O quarto já está reservado para as datas selecionadas.');
            } else {
                // Gerar número de confirmação
                const confirmacao = Math.random().toString(36).substr(2, 9);
                
                // Inserir nova reserva
                db.run(`INSERT INTO reservas (utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao)
                        VALUES (?, ?, ?, ?, ?)`,
                    [utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao],
                    function(err) {
                        if (err) {
                            res.status(500).send(err.message);
                        } else {
                            res.status(201).send({ confirmacao });
                        }
                    }
                );
            }
        }
    );
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
