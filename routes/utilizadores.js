const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'supersecretkey';  // Substituir por uma chave segura

// Registrar utilizador
router.post('/register', (req, res) => {
    const { nome, email, telefone, username, senha } = req.body;

    // Verifica se o username já existe
    db.get('SELECT * FROM utilizadores WHERE username = ?', [username], (err, row) => {
        if (row) {
            return res.status(400).send('O nome de utilizador já está em uso.');
        } else {
            const saltRounds = 10;
            const hash = bcrypt.hashSync(senha, saltRounds);
            db.run('INSERT INTO utilizadores (nome, email, telefone, username, senha) VALUES (?, ?, ?, ?, ?)', 
                [nome, email, telefone, username, hash], function(err) {
                if (err) {
                    res.status(500).send(err.message);
                } else {
                    res.status(201).send({ id: this.lastID });
                }
            });
        }
    });
});

// Login utilizador
router.post('/login', (req, res) => {
    const { username, senha } = req.body;

    db.get('SELECT * FROM utilizadores WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
        } else if (!row) {
            res.status(400).send('Nome de utilizador ou senha inválidos.');
        } else {
            // Verifica a senha
            const validPassword = bcrypt.compareSync(senha, row.senha);
            if (validPassword) {
                // Gera um token JWT
                const token = jwt.sign({ id: row.id, username: row.username }, secretKey, { expiresIn: '1h' });
                
                // Exclui a senha dos dados retornados
                const { senha, ...userWithoutPassword } = row;

                // Retorna os dados do utilizador sem a senha e o token JWT
                res.json({
                    message: 'Login bem-sucedido',
                    token,
                    user: userWithoutPassword
                });
            } else {
                res.status(400).send('Nome de utilizador ou senha inválidos.');
            }
        }
    });
});


// Gerir utilizador (listar todos)
router.get('/', (req, res) => {
    db.all('SELECT * FROM utilizadores', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Exemplo de rota protegida
router.get('/perfil', authenticateToken, (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.username}` });
});

module.exports = router;
