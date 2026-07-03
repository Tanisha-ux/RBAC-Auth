const express = require("express");
const recordRouter = express.Router();

const { addRecord, getRecords ,deleteRecords, updateRecords} = require("../controllers/record.js");

recordRouter.post("/", addRecord);       // POST /api/records
recordRouter.get("/", getRecords);       // GET  /api/records
recordRouter.delete("/:id", deleteRecords);
recordRouter.patch("/:id",updateRecords);

module.exports = recordRouter;