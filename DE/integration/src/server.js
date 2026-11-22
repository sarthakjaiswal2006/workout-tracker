// server.js : application entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { errorHandler } = require('./errors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {          // proves the backend can reach the database
  try { const r = await pool.query('SELECT NOW() AS db_time'); res.json({ status: 'ok', dbTime: r.rows[0].db_time }); }
  catch (e) { res.status(500).json({ status: 'db_unreachable' }); }
});

app.use('/api/users',     require('./routes/users'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workouts',  require('./routes/workouts'));
app.use('/api/stats',     require('./routes/stats'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
