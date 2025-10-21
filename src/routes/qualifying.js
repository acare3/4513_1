const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Normalizes a qualifying row into a nested payload.
 * @param {object} row - Combined qualifying row from SQLite.
 * @returns {object} Qualifying entry exposed through the API.
 */
const mapEntry = (row) => ({
  qualifyId: row.qualifyId,
  raceId: row.raceId,
  driverId: row.driverId,
  constructorId: row.constructorId,
  number: row.number,
  position: row.position,
  q1: row.q1,
  q2: row.q2,
  q3: row.q3,
  driver: {
    driverId: row.driverId,
    driverRef: row.driverRef,
    number: row.driverNumber,
    code: row.driverCode,
    forename: row.forename,
    surname: row.surname,
    dob: row.dob,
    nationality: row.driverNationality,
    url: row.driverUrl,
  },
  race: {
    raceId: row.raceId,
    name: row.raceName,
    round: row.raceRound,
    year: row.raceYear,
    date: row.raceDate,
  },
  constructor: {
    constructorId: row.constructorId,
    constructorRef: row.constructorRef,
    name: row.constructorName,
    nationality: row.constructorNationality,
    url: row.constructorUrl,
  },
});

/**
 * Endpoint: GET /api/qualifying/:raceId
 * Description: Retrieves qualifying classification for a specific race.
 * Path Parameters:
 *  - raceId: Race identifier.
 * Response: JSON array ordered by qualifying position or 404 if no entries exist.
 */
router.get('/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await db.all(
      `SELECT q.qualifyId, q.raceId, q.driverId, q.constructorId, q.number, q.position, q.q1, q.q2, q.q3,
              d.driverRef, d.number AS driverNumber, d.code AS driverCode, d.forename, d.surname, d.dob,
              d.nationality AS driverNationality, d.url AS driverUrl,
              c.constructorRef, c.name AS constructorName, c.nationality AS constructorNationality, c.url AS constructorUrl,
              r.name AS raceName, r.round AS raceRound, r.year AS raceYear, r.date AS raceDate
       FROM qualifying q
       INNER JOIN drivers d ON d.driverId = q.driverId
       INNER JOIN constructors c ON c.constructorId = q.constructorId
       INNER JOIN races r ON r.raceId = q.raceId
       WHERE q.raceId = ?
       ORDER BY q.position ASC`,
      [raceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No qualifying results found for race ${raceId}.` });
    }

    res.json(rows.map(mapEntry));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
