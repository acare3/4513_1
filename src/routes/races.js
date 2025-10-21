const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Normalizes a race row into a nested race representation.
 * @param {object} row - Combined race and circuit row returned by SQLite.
 * @returns {object} Race payload consumed by the API response.
 */
const mapRace = (row) => ({
  raceId: row.raceId,
  year: row.year,
  round: row.round,
  name: row.raceName,
  date: row.date,
  time: row.time,
  url: row.url,
  circuit: {
    circuitId: row.circuitId,
    circuitRef: row.circuitRef,
    name: row.circuitName,
    location: row.location,
    country: row.country,
  },
});

/**
 * Endpoint: GET /api/races/season/:year/:round
 * Description: Retrieves a single race for a given season and round.
 * Path Parameters:
 *  - year: Season year.
 *  - round: Round number within the season.
 * Response: JSON race object or 404 if the combination does not exist.
 */
router.get('/season/:year/:round', async (req, res) => {
  const { year, round } = req.params;
  try {
    const race = await db.get(
      `SELECT r.raceId, r.year, r.round, r.name AS raceName, r.date, r.time, r.url,
              c.circuitId, c.circuitRef, c.name AS circuitName, c.location, c.country
       FROM races r
       INNER JOIN circuits c ON c.circuitId = r.circuitId
       WHERE r.year = ? AND r.round = ?`,
      [year, round]
    );

    if (!race) {
      return res
        .status(404)
        .json({ error: `Race round ${round} for season ${year} was not found.` });
    }

    res.json(mapRace(race));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/races/season/:year
 * Description: Retrieves all races for a specified season ordered by round.
 * Path Parameters:
 *  - year: Season year.
 * Response: JSON array of races or 404 if the season is empty.
 */
router.get('/season/:year', async (req, res) => {
  const { year } = req.params;
  try {
    const races = await db.all(
      `SELECT r.raceId, r.year, r.round, r.name AS raceName, r.date, r.time, r.url,
              c.circuitId, c.circuitRef, c.name AS circuitName, c.location, c.country
       FROM races r
       INNER JOIN circuits c ON c.circuitId = r.circuitId
       WHERE r.year = ?
       ORDER BY r.round ASC`,
      [year]
    );

    if (races.length === 0) {
      return res.status(404).json({ error: `No races found for season ${year}.` });
    }

    res.json(races.map(mapRace));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/races/circuits/:ref/season/:start/:end
 * Description: Retrieves races held at a circuit across a range of seasons.
 * Path Parameters:
 *  - ref: Circuit reference (case-insensitive).
 *  - start: Starting season year.
 *  - end: Ending season year (inclusive).
 * Response: JSON array of races or 404 if none match. Returns 400 when the year range is invalid.
 */
router.get('/circuits/:ref/season/:start/:end', async (req, res) => {
  const { ref, start, end } = req.params;

  if (Number(end) < Number(start)) {
    return res
      .status(400)
      .json({ error: 'End year must be greater than or equal to start year.' });
  }

  try {
    const races = await db.all(
      `SELECT r.raceId, r.year, r.round, r.name AS raceName, r.date, r.time, r.url,
              c.circuitId, c.circuitRef, c.name AS circuitName, c.location, c.country
       FROM races r
       INNER JOIN circuits c ON c.circuitId = r.circuitId
       WHERE LOWER(c.circuitRef) = LOWER(?) AND r.year BETWEEN ? AND ?
       ORDER BY r.year ASC, r.round ASC`,
      [ref, start, end]
    );

    if (races.length === 0) {
      return res.status(404).json({
        error: `No races found for circuit '${ref}' between seasons ${start} and ${end}.`,
      });
    }

    res.json(races.map(mapRace));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/races/circuits/:ref
 * Description: Retrieves all races held at a specific circuit across all seasons.
 * Path Parameters:
 *  - ref: Circuit reference (case-insensitive).
 * Response: JSON array of races or 404 if none exist.
 */
router.get('/circuits/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const races = await db.all(
      `SELECT r.raceId, r.year, r.round, r.name AS raceName, r.date, r.time, r.url,
              c.circuitId, c.circuitRef, c.name AS circuitName, c.location, c.country
       FROM races r
       INNER JOIN circuits c ON c.circuitId = r.circuitId
       WHERE LOWER(c.circuitRef) = LOWER(?)
       ORDER BY r.year ASC, r.round ASC`,
      [ref]
    );

    if (races.length === 0) {
      return res.status(404).json({ error: `No races found for circuit '${ref}'.` });
    }

    res.json(races.map(mapRace));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/races/:raceId
 * Description: Retrieves a race by its numeric identifier.
 * Path Parameters:
 *  - raceId: Race identifier.
 * Response: JSON race object or 404 if not found.
 */
router.get('/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const race = await db.get(
      `SELECT r.raceId, r.year, r.round, r.name AS raceName, r.date, r.time, r.url,
              c.circuitId, c.circuitRef, c.name AS circuitName, c.location, c.country
       FROM races r
       INNER JOIN circuits c ON c.circuitId = r.circuitId
       WHERE r.raceId = ?`,
      [raceId]
    );

    if (!race) {
      return res.status(404).json({ error: `Race with id '${raceId}' was not found.` });
    }

    res.json(mapRace(race));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
