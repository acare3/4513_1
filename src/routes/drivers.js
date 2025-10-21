const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Maps a combined driver result row to a nested driver object.
 * @param {object} row - Row returned from the database join.
 * @returns {object} Normalized driver structure.
 */
const mapDriver = (row) => ({
  driverId: row.driverId,
  driverRef: row.driverRef,
  number: row.driverNumber,
  code: row.code,
  forename: row.forename,
  surname: row.surname,
  dob: row.dob,
  nationality: row.nationality,
  url: row.url,
});

/**
 * Endpoint: GET /api/drivers
 * Description: Retrieves all drivers ordered by surname then forename.
 * Response: JSON array of driver summaries.
 */
router.get('/', async (_req, res) => {
  try {
    const drivers = await db.all(
      `SELECT driverId, driverRef, number, code, forename, surname, dob, nationality, url
       FROM drivers
       ORDER BY surname, forename`
    );
    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/drivers/race/:raceId
 * Description: Retrieves the classified results for a single race including driver metadata.
 * Path Parameters:
 *  - raceId: Identifier of the race to load results for.
 * Response: JSON array of race result entries or 404 if none exist.
 */
router.get('/race/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await db.all(
      `SELECT r.resultId, r.raceId, r.number AS resultNumber, r.grid, r.position, r.positionText, r.positionOrder,
              r.points, r.laps, r.time, r.milliseconds, r.fastestLap, r.rank, r.fastestLapTime, r.fastestLapSpeed,
              r.statusId, s.status AS statusText,
              d.driverId, d.driverRef, d.number AS driverNumber, d.code, d.forename, d.surname, d.dob, d.nationality, d.url,
              c.constructorId, c.constructorRef, c.name AS constructorName, c.nationality AS constructorNationality,
              c.url AS constructorUrl,
              ra.name AS raceName, ra.round AS raceRound, ra.year AS raceYear, ra.date AS raceDate,
              ra.time AS raceTime, ra.url AS raceUrl
       FROM results r
       INNER JOIN drivers d ON d.driverId = r.driverId
       INNER JOIN constructors c ON c.constructorId = r.constructorId
       INNER JOIN races ra ON ra.raceId = r.raceId
       INNER JOIN status s ON s.statusId = r.statusId
       WHERE r.raceId = ?
       ORDER BY r.grid ASC`,
      [raceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No drivers found for race ${raceId}.` });
    }

    const results = rows.map((row) => ({
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
      driver: mapDriver(row),
      constructor: {
        constructorId: row.constructorId,
        constructorRef: row.constructorRef,
        name: row.constructorName,
        nationality: row.constructorNationality,
        url: row.constructorUrl,
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
    }));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/drivers/search/:substring
 * Description: Retrieves drivers whose surname begins with the provided substring.
 * Path Parameters:
 *  - substring: Case-insensitive starting characters of a surname.
 * Response: JSON array of drivers or 404 if none match.
 */
router.get('/search/:substring', async (req, res) => {
  const { substring } = req.params;
  try {
    const drivers = await db.all(
      `SELECT driverId, driverRef, number, code, forename, surname, dob, nationality, url
       FROM drivers
       WHERE LOWER(surname) LIKE LOWER(?)
       ORDER BY surname, forename`,
      [`${substring}%`]
    );

    if (drivers.length === 0) {
      return res.status(404).json({
        error: `No drivers found with surname starting with '${substring}'.`,
      });
    }

    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/drivers/:ref
 * Description: Retrieves a driver by their reference identifier.
 * Path Parameters:
 *  - ref: Driver reference (case-insensitive).
 * Response: JSON driver object or 404 if not found.
 */
router.get('/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const driver = await db.get(
      `SELECT driverId, driverRef, number, code, forename, surname, dob, nationality, url
       FROM drivers
       WHERE LOWER(driverRef) = LOWER(?)`,
      [ref]
    );

    if (!driver) {
      return res.status(404).json({ error: `Driver with ref '${ref}' was not found.` });
    }

    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
