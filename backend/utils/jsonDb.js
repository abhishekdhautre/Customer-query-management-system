import fs from 'fs';
import path from 'path';

const FALLBACK_DB_PATH = path.resolve('db_fallback.json');

// Ensure db_fallback.json exists
if (!fs.existsSync(FALLBACK_DB_PATH)) {
  fs.writeFileSync(
    FALLBACK_DB_PATH,
    JSON.stringify({ users: [], queries: [] }, null, 2)
  );
}

export const readDb = () => {
  try {
    const content = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON fallback DB:', err);
    return { users: [], queries: [] };
  }
};

export const writeDb = (data) => {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
};
