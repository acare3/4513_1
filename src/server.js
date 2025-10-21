const express = require('express');
const cors = require('cors');

const circuitsRouter = require('./routes/circuits');
const constructorsRouter = require('./routes/constructors');
const driversRouter = require('./routes/drivers');
const racesRouter = require('./routes/races');
const resultsRouter = require('./routes/results');
const qualifyingRouter = require('./routes/qualifying');
const standingsRouter = require('./routes/standings');

const app = express();

/**
 * Formula 1 REST API - COMP 4513 Assignment 1 implementation.
 * The server exposes read-only endpoints backed by the provided SQLite database.
 */

app.use(cors());
app.use(express.json());

/**
 * Endpoint: GET /
 * Description: Health check route that confirms the API is running.
 * Response: JSON message greeting the client.
 */
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Formula 1 API.' });
});

app.use('/api/circuits', circuitsRouter);
app.use('/api/constructors', constructorsRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/races', racesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/qualifying', qualifyingRouter);
app.use('/api/standings', standingsRouter);

/**
 * Catch-all handler for unsupported routes ensuring a consistent JSON error response.
 */
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' was not found.` });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
