const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Endpoint: GET /api/circuits
 * Description: Retrieves all circuits ordered alphabetically by name.
 * Response: JSON array of circuit summaries.
 */
router.get('/', async (req, res) => {
  try {
    const circuits = await db.all(
      `SELECT circuitId, circuitRef, name, location, country, lat, lng, alt, url
       FROM circuits
       ORDER BY name`
    );
    res.json(circuits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/circuits/season/:year
 * Description: Retrieves all circuits used in a specific season ordered by round.
 * Path Parameters:
 *  - year: Season year to filter on.
 * Response: JSON array of circuit summaries or 404 if none are found.
 */
router.get('/season/:year', async (req, res) => {
  const { year } = req.params;
  try {
    const circuits = await db.all(
      `SELECT DISTINCT c.circuitId, c.circuitRef, c.name, c.location, c.country, c.lat, c.lng, c.alt, c.url
       FROM circuits c
       INNER JOIN races r ON r.circuitId = c.circuitId
       WHERE r.year = ?
       ORDER BY r.round ASC`,
      [year]
    );

    if (circuits.length === 0) {
      return res.status(404).json({ error: `No circuits found for season ${year}.` });
    }

    res.json(circuits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/circuits/:ref
 * Description: Retrieves a circuit by its reference identifier.
 * Path Parameters:
 *  - ref: Circuit reference (case-insensitive).
 * Response: JSON object containing circuit details or 404 if not found.
 */
router.get('/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const circuit = await db.get(
      `SELECT circuitId, circuitRef, name, location, country, lat, lng, alt, url
       FROM circuits
       WHERE LOWER(circuitRef) = LOWER(?)`,
      [ref]
    );

    if (!circuit) {
      return res.status(404).json({ error: `Circuit with ref '${ref}' was not found.` });
    }

    res.json(circuit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
