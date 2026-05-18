import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

/* FIX FOR __dirname (your code was missing __filename) */
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
   CHANGED DB NAME HERE VIA .env
============================== */

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // 👈 NOW USES campus_event_scheduller
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
      database: process.env.DB_NAME
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
      SET campusName=?, heroHeadline=?, heroSubheadline=?, heroImage=?, footerText=?, logoImage=?
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
        id, title, description, date, startTime, endTime,
        location, category, organizer, attendees, image,
        isPopular, isLive, status
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

    res.status(201).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   USERS (LOGIN STILL WORKS)
============================== */

app.post('/api/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email=?',
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    delete user.password;

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   FRONTEND FALLBACK
============================== */

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/* ==============================
   START SERVER
============================== */

app.listen(PORT, () => {
  console.log(`
========================================
 CAMPUSPULSE SERVER ACTIVE
 PORT: ${PORT}
 DATABASE: ${process.env.DB_NAME}
========================================
  `);
});
