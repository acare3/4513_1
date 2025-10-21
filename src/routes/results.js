const express = require('express');
const db = require('../db');

const router = express.Router();

// Shared SELECT used by the results endpoints to keep the SQL consistent across queries.
const baseResultsQuery = `
  SELECT r.resultId, r.raceId, r.number AS resultNumber, r.grid, r.position,
         r.positionText, r.positionOrder, r.points, r.laps, r.time, r.milliseconds,
         r.fastestLap, r.rank, r.fastestLapTime, r.fastestLapSpeed, r.statusId,
         s.status AS statusText,
         d.driverId, d.driverRef, d.number AS driverNumber, d.code AS driverCode, d.forename, d.surname, d.dob,
         d.nationality AS driverNationality, d.url AS driverUrl,
         c.constructorId, c.constructorRef, c.name AS constructorName, c.nationality AS constructorNationality, c.url AS constructorUrl,
         ra.name AS raceName, ra.round AS raceRound, ra.year AS raceYear, ra.date AS raceDate,
         ra.time AS raceTime, ra.url AS raceUrl
  FROM results r
  INNER JOIN drivers d ON d.driverId = r.driverId
  INNER JOIN constructors c ON c.constructorId = r.constructorId
  INNER JOIN races ra ON ra.raceId = r.raceId
  INNER JOIN status s ON s.statusId = r.statusId
`;

/**
 * Normalizes a result row into a nested payload containing driver, race, and constructor details.
 * @param {object} row - Combined result row returned by SQLite.
 * @returns {object} Result payload for API responses.
 */
const mapResult = (row) => ({
  resultId: row.resultId,
  raceId: row.raceId,
  number: row.resultNumber,
  grid: row.grid,
  position: row.position,
  positionText: row.positionText,
  positionOrder: row.positionOrder,
  points: row.points,
  laps: row.laps,
  time: row.time,
  milliseconds: row.milliseconds,
  fastestLap: row.fastestLap,
  rank: row.rank,
  fastestLapTime: row.fastestLapTime,
  fastestLapSpeed: row.fastestLapSpeed,
  status: {
    statusId: row.statusId,
    status: row.statusText,
  },
  driver: {
    driverId: row.driverId,
    driverRef: row.driverRef,
    number: row.driverNumber,
    code: row.driverCode,
    forename: row.forename,
    surname: row.surname,
    dateOfBirth: row.dob,
    nationality: row.driverNationality,
    url: row.driverUrl,
  },
  race: {
    raceId: row.raceId,
    name: row.raceName,
    round: row.raceRound,
    year: row.raceYear,
    date: row.raceDate,
    time: row.raceTime,
    url: row.raceUrl,
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
 * Endpoint: GET /api/results/drivers/:ref/seasons/:start/:end
 * Description: Retrieves results for a driver across an inclusive range of seasons.
 * Path Parameters:
 *  - ref: Driver reference (case-insensitive).
 *  - start: Starting season year.
 *  - end: Ending season year.
 * Response: JSON array of results or 404 if none match. Returns 400 when the range is invalid.
 */
router.get('/drivers/:ref/seasons/:start/:end', async (req, res) => {
  const { ref, start, end } = req.params;

  if (Number(end) < Number(start)) {
    return res
      .status(400)
      .json({ error: 'End year must be greater than or equal to start year.' });
  }

  try {
    const rows = await db.all(
      `${baseResultsQuery}
       WHERE LOWER(d.driverRef) = LOWER(?) AND ra.year BETWEEN ? AND ?
       ORDER BY ra.year ASC, ra.round ASC, r.grid ASC`,
      [ref, start, end]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No results found for driver '${ref}' between seasons ${start} and ${end}.`,
      });
    }

    res.json(rows.map(mapResult));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/results/driver/:ref
 * Description: Retrieves every recorded result for a specific driver.
 * Path Parameters:
 *  - ref: Driver reference (case-insensitive).
 * Response: JSON array of results or 404 if the driver has no results.
 */
router.get('/driver/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const rows = await db.all(
      `${baseResultsQuery}
       WHERE LOWER(d.driverRef) = LOWER(?)
       ORDER BY ra.year ASC, ra.round ASC, r.grid ASC`,
      [ref]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No results found for driver '${ref}'.` });
    }

    res.json(rows.map(mapResult));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/results/:raceId
 * Description: Retrieves classified results for a specific race.
 * Path Parameters:
 *  - raceId: Race identifier.
 * Response: JSON array of results or 404 if the race has no results.
 */
router.get('/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await db.all(
      `${baseResultsQuery}
       WHERE r.raceId = ?
       ORDER BY r.grid ASC`,
      [raceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No results found for race ${raceId}.` });
    }

    res.json(rows.map(mapResult));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
