const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Endpoint: GET /api/constructors
 * Description: Retrieves all constructors ordered alphabetically by name.
 * Response: JSON array of constructor summaries.
 */
router.get('/', async (_req, res) => {
  try {
    const constructors = await db.all(
      `SELECT constructorId, constructorRef, name, nationality, url
       FROM constructors
       ORDER BY name`
    );
    res.json(constructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

/**
 * Endpoint: GET /api/constructors/:ref
 * Description: Retrieves a constructor by its reference identifier.
 * Path Parameters:
 *  - ref: Constructor reference (case-insensitive).
 * Response: JSON object containing constructor details or 404 if not found.
 */
router.get('/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const constructor = await db.get(
      `SELECT constructorId, constructorRef, name, nationality, url
       FROM constructors
       WHERE LOWER(constructorRef) = LOWER(?)`,
      [ref]
    );

    if (!constructor) {
      return res.status(404).json({ error: `Constructor with ref '${ref}' was not found.` });
    }

    res.json(constructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
