const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Endpoint: GET /api/standings/drivers/:raceId
 * Description: Retrieves the driver standings after a specific race.
 * Path Parameters:
 *  - raceId: Race identifier.
 * Response: JSON array of standings ordered by position or 404 if none exist.
 */
router.get('/drivers/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await db.all(
      `SELECT ds.driverStandingsId, ds.raceId, ds.points, ds.position, ds.positionText, ds.wins,
              d.driverId, d.driverRef, d.number AS driverNumber, d.code AS driverCode, d.forename, d.surname, d.dob,
              d.nationality AS driverNationality, d.url AS driverUrl,
              r.name AS raceName, r.round AS raceRound, r.year AS raceYear, r.date AS raceDate,
              r.time AS raceTime, r.url AS raceUrl
       FROM driverStandings ds
       INNER JOIN drivers d ON d.driverId = ds.driverId
       INNER JOIN races r ON r.raceId = ds.raceId
       WHERE ds.raceId = ?
       ORDER BY ds.position ASC`,
      [raceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No driver standings found for race ${raceId}.` });
    }

    res.json(
      rows.map((row) => ({
        driverStandingsId: row.driverStandingsId,
        position: row.position,
        positionText: row.positionText,
        points: row.points,
        wins: row.wins,
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
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/standings/constructors/:raceId
 * Description: Retrieves the constructor standings after a specific race.
 * Path Parameters:
 *  - raceId: Race identifier.
 * Response: JSON array of standings ordered by position or 404 if none exist.
 */
router.get('/constructors/:raceId', async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await db.all(
      `SELECT cs.constructorStandingsId, cs.raceId, cs.points, cs.position, cs.positionText, cs.wins,
              c.constructorId, c.constructorRef, c.name AS constructorName, c.nationality AS constructorNationality, c.url AS constructorUrl,
              r.name AS raceName, r.round AS raceRound, r.year AS raceYear, r.date AS raceDate,
              r.time AS raceTime, r.url AS raceUrl
       FROM constructorStandings cs
       INNER JOIN constructors c ON c.constructorId = cs.constructorId
       INNER JOIN races r ON r.raceId = cs.raceId
       WHERE cs.raceId = ?
       ORDER BY cs.position ASC`,
      [raceId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: `No constructor standings found for race ${raceId}.` });
    }

    res.json(
      rows.map((row) => ({
        constructorStandingsId: row.constructorStandingsId,
        position: row.position,
        positionText: row.positionText,
        points: row.points,
        wins: row.wins,
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
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
