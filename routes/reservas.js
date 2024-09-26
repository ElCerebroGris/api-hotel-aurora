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
                db.run(`INSERT INTO reservas (utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao, estado)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [utilizador_id, quarto_id, checkin_date, checkout_date, confirmacao, 'pendente'],
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

router.put('/:id/estado', (req, res) => {
    const { id } = req.params; // ID da reserva
    const { estado } = req.body; // Novo estado a ser aplicado

    // Verificar se o estado é válido (opcional)
    const estadosValidos = ['pendente', 'confirmada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).send('Estado inválido. Estados válidos: pendente, confirmada, cancelada.');
    }

    // Atualizar o estado da reserva no banco de dados
    db.run(`UPDATE reservas SET estado = ? WHERE id = ?`, [estado, id], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else if (this.changes === 0) {
            res.status(404).send('Reserva não encontrada.');
        } else {
            res.status(200).send({ message: 'Estado da reserva atualizado com sucesso.' });
        }
    });
});

router.get('/total', (req, res) => {
    const query = `
        SELECT r.id, r.confirmacao, r.checkin_date, r.checkout_date, u.nome AS utilizador, q.nome AS quarto, 
               SUM(COALESCE(q.preco, 0) + COALESCE(rs.preco_total, 0)) AS montante_total
        FROM reservas r
        JOIN quartos q ON r.quarto_id = q.id
        JOIN utilizadores u ON r.utilizador_id = u.id
        LEFT JOIN reservas_servicos rs ON r.id = rs.reserva_id
        GROUP BY r.id
    `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

router.get('/estatisticas', (req, res) => {
    const { periodo } = req.query; // 'dia', 'mes', 'ano'

    let groupBy;
    if (periodo === 'mes') {
        groupBy = "strftime('%Y-%m', checkin_date)"; // Agrupa por mês
    } else if (periodo === 'ano') {
        groupBy = "strftime('%Y', checkin_date)"; // Agrupa por ano
    } else {
        groupBy = "DATE(checkin_date)"; // Padrão: Agrupa por dia
    }

    const query = `
        SELECT 
            ${groupBy} as data, 
            COUNT(*) as total_reservas, 
            SUM(q.preco) as montante_faturado
        FROM reservas r
        JOIN quartos q ON r.quarto_id = q.id
        GROUP BY ${groupBy}
        ORDER BY data ASC
    `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json({
                periodos: rows
            });
        }
    });
});


module.exports = router;
