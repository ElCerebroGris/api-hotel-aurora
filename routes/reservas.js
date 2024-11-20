const express = require("express");
const router = express.Router();
const db = require("../database");

// Fazer reserva
// Rota para criar uma nova reserva
router.post("/", async (req, res) => {
  const { quarto_id, checkin_date, checkout_date, utilizador_id, servicos } = req.body;
  const confirmacao = Math.random().toString(36).substr(2, 9);

  try {
    // Insere a reserva na tabela `reservas`
    const reservaId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reservas (quarto_id, checkin_date, checkout_date, utilizador_id, confirmacao, estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quarto_id, checkin_date, checkout_date, utilizador_id, confirmacao, "pendente"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID); // Obtém o ID da reserva recém-criada
        }
      );
    });

    // Insere os serviços associados à reserva
    if (servicos && servicos.length > 0) {
      // Prepara o statement para inserir serviços
      const stmt = db.prepare(
        `INSERT INTO reservas_servicos (reserva_id, servico_id, quantidade, preco_total) VALUES (?, ?, ?, ?)`
      );

      for (const servicoId of servicos) {
        const preco = await new Promise((resolve, reject) => {
          db.get(
            `SELECT preco FROM servicos WHERE id = ?`,
            [servicoId],
            (err, row) => {
              if (err) reject(err);
              else if (row) resolve(row.preco);
              else reject(new Error("Serviço não encontrado"));
            }
          );
        });

        // Insere o serviço com quantidade 1 e calcula o preço total
        await new Promise((resolve, reject) => {
          stmt.run(reservaId, servicoId, 1, preco, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      stmt.finalize(); // Finaliza o statement após a execução
    }

    // Retorna a confirmação da reserva
    res.status(201).send({ confirmacao });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


router.put("/:id/estado", (req, res) => {
  const { id } = req.params; // ID da reserva
  const { estado } = req.body; // Novo estado a ser aplicado

  // Verificar se o estado é válido (opcional)
  const estadosValidos = ["pendente", "confirmada", "cancelada"];
  if (!estadosValidos.includes(estado)) {
    return res
      .status(400)
      .send(
        "Estado inválido. Estados válidos: pendente, confirmada, cancelada."
      );
  }

  // Atualizar o estado da reserva no banco de dados
  db.run(
    `UPDATE reservas SET estado = ? WHERE id = ?`,
    [estado, id],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else if (this.changes === 0) {
        res.status(404).send("Reserva não encontrada.");
      } else {
        res
          .status(200)
          .send({ message: "Estado da reserva atualizado com sucesso." });
      }
    }
  );
});

router.get("/", (req, res) => {
  const query = `
        SELECT 
            r.id, 
            r.confirmacao, 
            r.checkin_date, 
            r.checkout_date, 
            u.nome AS utilizador, 
            q.descricao AS quarto, 
            r.estado,
            GROUP_CONCAT(s.descricao, ', ') AS servicos,
            (
                (julianday(r.checkout_date) - julianday(r.checkin_date)) * COALESCE(q.preco, 0) + 
                SUM(COALESCE(rs.preco_total, 0))
            ) AS montante_total
        FROM reservas r
        LEFT JOIN quartos q ON r.quarto_id = q.id
        LEFT JOIN utilizadores u ON r.utilizador_id = u.id
        LEFT JOIN reservas_servicos rs ON r.id = rs.reserva_id
        LEFT JOIN servicos s ON rs.servico_id = s.id
        GROUP BY r.id
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});



router.get("/estatisticas", (req, res) => {
  const { periodo } = req.query; // 'dia', 'mes', 'ano'

  let groupBy;
  if (periodo === "mes") {
    groupBy = "strftime('%Y-%m', checkin_date)"; // Agrupa por mês
  } else if (periodo === "ano") {
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
        periodos: rows,
      });
    }
  });
});

module.exports = router;
