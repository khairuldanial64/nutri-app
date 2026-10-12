import * as SQLite from 'expo-sqlite';

let db;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('macrotracker.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY,
        calories INTEGER NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL
      );

      INSERT OR IGNORE INTO goals (id, calories, protein_g, carbs_g, fat_g)
      VALUES (1, 2000, 125, 200, 50);
    `);
  }
  return db;
}

export async function logMeal(macros) {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO meals (meal_name, calories, protein_g, carbs_g, fat_g, logged_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [macros.meal_name, macros.calories, macros.protein_g, macros.carbs_g, macros.fat_g, now]
  );
}

export async function getTodaysMeals() {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(
    `SELECT * FROM meals WHERE logged_at LIKE ? ORDER BY logged_at DESC`,
    [`${today}%`]
  );
}

export async function getTodaysTotals() {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getFirstAsync(
    `SELECT
      COALESCE(SUM(calories), 0) as calories,
      COALESCE(SUM(protein_g), 0) as protein_g,
      COALESCE(SUM(carbs_g), 0) as carbs_g,
      COALESCE(SUM(fat_g), 0) as fat_g
     FROM meals WHERE logged_at LIKE ?`,
    [`${today}%`]
  );
  return result;
}

export async function getGoals() {
  const db = await getDB();
  return await db.getFirstAsync(`SELECT * FROM goals WHERE id = 1`);
}

export async function updateGoals(calories, protein_g, carbs_g, fat_g) {
  const db = await getDB();
  await db.runAsync(
    `UPDATE goals SET calories = ?, protein_g = ?, carbs_g = ?, fat_g = ? WHERE id = 1`,
    [calories, protein_g, carbs_g, fat_g]
  );
}

export async function deleteMeal(id) {
  const db = await getDB();
  await db.runAsync(`DELETE FROM meals WHERE id = ?`, [id]);
}

export async function getAllMealDays() {
  const db = await getDB();
  const rows = await db.getAllAsync(
    `SELECT DISTINCT DATE(logged_at) as day FROM meals ORDER BY day DESC`
  );
  return rows.map(r => r.day);
}

export async function getMealsByDay(day) {
  const db = await getDB();
  return await db.getAllAsync(
    `SELECT * FROM meals WHERE logged_at LIKE ? ORDER BY logged_at ASC`,
    [`${day}%`]
  );
}

export async function getWeeklyTotals() {
  const db = await getDB();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  return await db.getFirstAsync(
    `SELECT
      COALESCE(SUM(calories), 0) as calories,
      COALESCE(SUM(protein_g), 0) as protein_g,
      COALESCE(SUM(carbs_g), 0) as carbs_g,
      COALESCE(SUM(fat_g), 0) as fat_g,
      COUNT(DISTINCT DATE(logged_at)) as days_tracked
     FROM meals WHERE logged_at >= ?`,
    [`${sevenDaysAgo}T00:00:00.000Z`]
  );
}