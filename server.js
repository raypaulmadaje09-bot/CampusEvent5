import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

/* ==============================
   MIDDLEWARE
============================== */

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use(express.static(path.join(__dirname, 'dist')));

/* ==============================
   DATABASE CONNECTION
============================== */

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10
});

/* ==============================
   HEALTH CHECK
============================== */

app.get('/api/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    res.json({
      status: 'UP',
      database: 'CONNECTED'
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      error: err.message
    });
  }
});

/* ==============================
   CONFIG
============================== */

app.get('/api/config', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM site_config WHERE id = 1'
    );

    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const {
      campusName,
      heroHeadline,
      heroSubheadline,
      heroImage,
      footerText,
      logoImage
    } = req.body;

    await pool.query(
      `
      UPDATE site_config
      SET
        campusName=?,
        heroHeadline=?,
        heroSubheadline=?,
        heroImage=?,
        footerText=?,
        logoImage=?
      WHERE id=1
      `,
      [
        campusName,
        heroHeadline,
        heroSubheadline,
        heroImage,
        footerText,
        logoImage
      ]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   EVENTS
============================== */

app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM events ORDER BY date DESC'
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const e = req.body;

    await pool.query(
      `
      INSERT INTO events (
        id,
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        category,
        organizer,
        attendees,
        image,
        isPopular,
        isLive,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        e.id,
        e.title,
        e.description,
        e.date,
        e.startTime,
        e.endTime,
        e.location,
        e.category,
        e.organizer,
        e.attendees || 0,
        e.image || '',
        e.isPopular || false,
        e.isLive || false,
        e.status || 'Pending'
      ]
    );

    res.status(201).json({
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const e = req.body;

    await pool.query(
      `
      UPDATE events
      SET
        title=?,
        description=?,
        date=?,
        startTime=?,
        endTime=?,
        location=?,
        category=?,
        organizer=?,
        attendees=?,
        image=?,
        isPopular=?,
        isLive=?,
        status=?
      WHERE id=?
      `,
      [
        e.title,
        e.description,
        e.date,
        e.startTime,
        e.endTime,
        e.location,
        e.category,
        e.organizer,
        e.attendees || 0,
        e.image || '',
        e.isPopular || false,
        e.isLive || false,
        e.status,
        id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM events WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   USERS
============================== */

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        avatar
      FROM users
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE USER */

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;

    const hashedPassword = await bcrypt.hash(
      u.password,
      10
    );

    await pool.query(
      `
      INSERT INTO users (
        id,
        name,
        email,
        password,
        role,
        avatar
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        u.id,
        u.name,
        u.email,
        hashedPassword,
        u.role,
        u.avatar || ''
      ]
    );

    res.status(201).json({
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* LOGIN */

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    delete user.password;

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE USER */

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      role,
      avatar
    } = req.body;

    let hashedPassword = password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `
      UPDATE users
      SET
        name=?,
        email=?,
        password=?,
        role=?,
        avatar=?
      WHERE id=?
      `,
      [
        name,
        email,
        hashedPassword,
        role,
        avatar,
        id
      ]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE USER */

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM users WHERE id=?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   FEEDBACK
============================== */

app.get('/api/feedback', async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM feedback ORDER BY timestamp DESC'
    );

    for (const msg of messages) {
      const [replies] = await pool.query(
        `
        SELECT * FROM replies
        WHERE feedback_id=?
        ORDER BY timestamp ASC
        `,
        [msg.id]
      );

      msg.replies = replies;
    }

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   AUDIT LOGS
============================== */

app.get('/api/audit', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC'
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   REACT/VITE FALLBACK
============================== */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, 'dist', 'index.html')
  );
});

/* ==============================
   SERVER START
============================== */

app.listen(PORT, () => {
  console.log(`
===================================
 CAMPUSPULSE SERVER ACTIVE
 PORT: ${PORT}
 DATABASE: CONNECTED
===================================
  `);
});
