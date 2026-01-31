import { Handler } from "@netlify/functions";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: "postgresql://neondb_owner:npg_oipqI3eGCgw2@ep-raspy-lab-actmcgwy-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const client = await pool.connect();
  try {
    if (event.httpMethod === "GET") {
      const res = await client.query('SELECT * FROM messages ORDER BY updated_at DESC LIMIT 1');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(res.rows[0] || { content: "" }),
      };
    }

    if (event.httpMethod === "POST") {
      const { content, adminKey } = JSON.parse(event.body || "{}");
      const isAuthorized = adminKey === process.env.SESSION_SECRET || 
                          adminKey === "Chap@4472" || 
                          adminKey === process.env.PASSWORD;

      if (!isAuthorized) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: "Unauthorized" }) };
      }

      const res = await client.query(
        'INSERT INTO messages (content, updated_at) VALUES ($1, $2) RETURNING *',
        [content, new Date().toISOString()]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(res.rows[0]),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Error", error: String(err) }),
    };
  } finally {
    client.release();
  }

  return { statusCode: 405, headers, body: "Method Not Allowed" };
};
