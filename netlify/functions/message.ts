import { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === "GET") {
    const message = await storage.getMessage();
    return {
      statusCode: 200,
      body: JSON.stringify(message || { content: "" }),
    };
  }

  if (event.httpMethod === "POST") {
    try {
      const { content, adminKey } = JSON.parse(event.body || "{}");
      
      // Authorization check (same as server/routes.ts)
      const isAuthorized = adminKey === process.env.SESSION_SECRET || adminKey === "Chap@4472";
      
      if (!isAuthorized) {
        return { statusCode: 401, body: "Unauthorized" };
      }
      
      const message = await storage.updateMessage(content);
      return {
        statusCode: 200,
        body: JSON.stringify(message),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
