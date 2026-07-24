import { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const settings = await storage.getSettings();

      return {
        statusCode: 200,
        body: JSON.stringify(settings),
      };
    }

    if (event.httpMethod === "POST") {
      const {
        day,
        startTime,
        endTime,
        startPeriod,
        endPeriod,
        pouseCount,
        pouseDuur,
        breakAfter,
        adminKey,
      } = JSON.parse(event.body || "{}");

      const isAuthorized =
        adminKey === process.env.SESSION_SECRET ||
        adminKey === process.env.PASSWORD ||
        adminKey === "Chap@4472";

      if (!isAuthorized) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Unauthorized" }),
        };
      }

      const settings = await storage.updateSettings(
        day,
        startTime,
        endTime,
        startPeriod,
        endPeriod,
        pouseCount,
        pouseDuur,
        breakAfter,
      );

      return {
        statusCode: 200,
        body: JSON.stringify(settings),
      };
    }

    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
