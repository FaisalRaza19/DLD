import Agenda from "agenda";
import dotenv from "dotenv";

dotenv.config();

const agenda = new Agenda({
  db: { address: process.env.DB_URL, collection: "agendaJobs" },
  processEvery: "30 seconds",
  maxConcurrency: 20,
  defaultLockLifetime: 5 * 60 * 1000,
});

export default agenda;
