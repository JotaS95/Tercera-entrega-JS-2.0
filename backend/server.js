const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Ensure data directory and db.json exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, data: {} }));
}

// Helpers
const readDB = () => {
    let raw = fs.readFileSync(DB_PATH, 'utf-8');
    // Strip BOM if present
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
};
const writeDB = (data) => {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(DB_PATH, content, { encoding: 'utf8' });
};
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Endpoints

// List users (just names)
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(Object.keys(db.users));
});

// Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (db.users[username]) {
        return res.status(400).json({ error: 'Usuario ya existe' });
    }

    db.users[username] = { password: hash(password) };
    db.data[username] = { 
        transacciones: [], 
        presupuesto: 0, 
        fondo: 'default' 
    };

    writeDB(db);
    res.json({ success: true });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (!db.users[username] || db.users[username].password !== hash(password)) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ success: true, username });
});

// Get User Data
app.get('/api/data/:username', (req, res) => {
    const { username } = req.params;
    const db = readDB();

    if (!db.data[username]) {
        return res.status(404).json({ error: 'Datos no encontrados' });
    }

    res.json(db.data[username]);
});

// Update User Data
app.post('/api/data/:username', (req, res) => {
    const { username } = req.params;
    const { transacciones, presupuesto, fondo } = req.body;
    const db = readDB();

    if (!db.data[username]) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    db.data[username] = { 
        transacciones: transacciones || db.data[username].transacciones,
        presupuesto: presupuesto !== undefined ? presupuesto : db.data[username].presupuesto,
        fondo: fondo || db.data[username].fondo
    };

    writeDB(db);
    res.json({ success: true });
});

// Delete User
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const db = readDB();

    delete db.users[username];
    delete db.data[username];

    writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor "Pro" corriendo en http://localhost:${PORT}`);
});
