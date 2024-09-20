const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/hotel.db');

db.serialize(() => {
    // Criação das tabelas
    db.run(`CREATE TABLE IF NOT EXISTS funcionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        cargo TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS utilizadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        telefone TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS quartos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT,
        comodidades TEXT,
        preco REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilizador_id INTEGER,
        quarto_id INTEGER,
        checkin_date TEXT,
        checkout_date TEXT,
        confirmacao TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pagamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reserva_id INTEGER,
        valor REAL,
        metodo_pagamento TEXT,
        status TEXT
    )`);
});

module.exports = db;
