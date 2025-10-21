# Formula 1 REST API

An implementation of the COMP 4513 Assignment 1 REST API built with **Node.js**, **Express**, and the provided **SQLite** Formula 1 database. All payloads conform to the assignment specification by exposing rich nested data instead of foreign key identifiers.

## Live service

- **Base URL:** [`https://four513-1.onrender.com`](https://four513-1.onrender.com)
- **Status:** The Render service runs `npm start` and serves the API on port `3000`.

Use the clickable links below to exercise each required endpoint against the deployed instance. Replace the sample parameters to explore different seasons, drivers, and races.

### Circuits
- [GET /api/circuits](https://four513-1.onrender.com/api/circuits)
- [GET /api/circuits/monza](https://four513-1.onrender.com/api/circuits/monza)
- [GET /api/circuits/calgary](https://four513-1.onrender.com/api/circuits/calgary)
- [GET /api/circuits/season/2020](https://four513-1.onrender.com/api/circuits/season/2020)

### Constructors
- [GET /api/constructors](https://four513-1.onrender.com/api/constructors)
- [GET /api/constructors/ferrari](https://four513-1.onrender.com/api/constructors/ferrari)

### Drivers
- [GET /api/drivers](https://four513-1.onrender.com/api/drivers)
- [GET /api/drivers/norris](https://four513-1.onrender.com/api/drivers/norris)
- [GET /api/drivers/connolly](https://four513-1.onrender.com/api/drivers/connolly)
- [GET /api/drivers/search/sch](https://four513-1.onrender.com/api/drivers/search/sch)
- [GET /api/drivers/race/1069](https://four513-1.onrender.com/api/drivers/race/1069)

### Races
- [GET /api/races/1034](https://four513-1.onrender.com/api/races/1034)
- [GET /api/races/season/2021](https://four513-1.onrender.com/api/races/season/2021)
- [GET /api/races/season/2020/5](https://four513-1.onrender.com/api/races/season/2020/5)
- [GET /api/races/season/2020/100](https://four513-1.onrender.com/api/races/season/2020/100)
- [GET /api/races/circuits/monza](https://four513-1.onrender.com/api/races/circuits/monza)
- [GET /api/races/circuits/monza/season/2015/2022](https://four513-1.onrender.com/api/races/circuits/monza/season/2015/2022)
- [GET /api/races/circuits/monza/season/2022/2022](https://four513-1.onrender.com/api/races/circuits/monza/season/2022/2022)

### Results & Qualifying
- [GET /api/results/1106](https://four513-1.onrender.com/api/results/1106)
- [GET /api/results/driver/max_verstappen](https://four513-1.onrender.com/api/results/driver/max_verstappen)
- [GET /api/results/driver/connolly](https://four513-1.onrender.com/api/results/driver/connolly)
- [GET /api/results/drivers/sainz/seasons/2021/2022](https://four513-1.onrender.com/api/results/drivers/sainz/seasons/2021/2022)
- [GET /api/results/drivers/sainz/seasons/2035/2022](https://four513-1.onrender.com/api/results/drivers/sainz/seasons/2035/2022)
- [GET /api/qualifying/1106](https://four513-1.onrender.com/api/qualifying/1106)

### Standings
- [GET /api/standings/drivers/1120](https://four513-1.onrender.com/api/standings/drivers/1120)
- [GET /api/standings/constructors/1120](https://four513-1.onrender.com/api/standings/constructors/1120)
- [GET /api/standings/constructors/9999](https://four513-1.onrender.com/api/standings/constructors/9999)

## Running locally

```bash
npm install
npm start
```

The API starts on [http://localhost:3000](http://localhost:3000). Ensure the SQLite database at `data/f1.db` is accessible to the server process. All responses match the deployed instance and exclude raw foreign keys as required by the assignment.

## Error handling

- Parameterised routes return **404 Not Found** when the selection yields no rows.
- Range-based endpoints validate the year span and return **400 Bad Request** with a descriptive error if the end year precedes the start year.
