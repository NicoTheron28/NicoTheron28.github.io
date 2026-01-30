import { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../shared/schema";
import { desc } from "drizzle-orm";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === "GET") {
    try {
      const [message] = await db.select().from(schema.messages).orderBy(desc(schema.messages.updatedAt)).limit(1);
      return {
        statusCode: 200,
        body: JSON.stringify(message || { content: "" }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const { content, adminKey } = JSON.parse(event.body || "{}");
      
      const isAuthorized = adminKey === process.env.SESSION_SECRET || adminKey === "Chap@4472";
      
      if (!isAuthorized) {
        return { statusCode: 401, body: "Unauthorized" };
      }
      
      const [message] = await db.insert(schema.messages).values({
        content,
        updatedAt: new Date().toISOString()
      }).returning();

      return {
        statusCode: 200,
        body: JSON.stringify(message),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error", error: String(err) }),
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
