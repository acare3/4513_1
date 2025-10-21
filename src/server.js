const express = require('express');
const cors = require('cors');

const registerCircuitRoutes = require('./routes/circuits');
const registerConstructorRoutes = require('./routes/constructors');
const registerDriverRoutes = require('./routes/drivers');
const registerRaceRoutes = require('./routes/races');
const registerResultRoutes = require('./routes/results');
const registerQualifyingRoutes = require('./routes/qualifying');
const registerStandingRoutes = require('./routes/standings');

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
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Formula 1 API.' });
});

registerCircuitRoutes(app);
registerConstructorRoutes(app);
registerDriverRoutes(app);
registerRaceRoutes(app);
registerResultRoutes(app);
registerQualifyingRoutes(app);
registerStandingRoutes(app);

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
