// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import getDBConnection from "./database.js";

// // Resolve __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Read schema and seed files from current directory
// const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
// const seedData = fs.readFileSync(path.join(__dirname, "seeds.sql"), "utf8");

// try {
//   const db = await getDBConnection();
//   if (!db) {
//     console.log("connetion");
//   }

//   await db.exec(schema);
//   console.log("✅ Database schema initialized successfully");

//   await db.exec(seedData);
//   console.log("🌱 Database seeded successfully");
// } catch (err) {
//   console.error("❌ Error during DB initialization:", err.message);
//   process.exit(1);
// }

import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.join(__dirname, "ecommerce.db");
const schemaPath = path.join(__dirname, "schema.sql");
const seedsPath = path.join(__dirname, "seeds.sql");

// Strip BOM if present
function readSqlFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  return content.replace(/^\uFEFF/, "");
}

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("❌ Failed to open DB:", err.message);
      return;
    }

    console.log("📦 Connected to SQLite DB");

    const schemaSQL = readSqlFile(schemaPath);
    const seedsSQL = readSqlFile(seedsPath);

    db.exec(schemaSQL, (err1) => {
      if (err1) {
        console.error("❌ Error applying schema.sql:", err1.message);
        return;
      }

      console.log("✅ schema.sql applied");

      db.exec(seedsSQL, (err2) => {
        if (err2) {
          console.error("❌ Error applying seeds.sql:", err2.message);
          return;
        }

        console.log("✅ seeds.sql applied — Database Ready!");
        db.close();
      });
    });
  }
);
