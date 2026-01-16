import { Handler } from "@netlify/functions";
import { storage } from "../../server/storage";
import { api } from "../../shared/routes";
import { z } from "zod";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Simplified path matching since it's a specific function
  try {
    const body = JSON.parse(event.body || "{}");
    const input = api.schedules.create.input.parse(body);
    const schedule = await storage.createSchedule(input);
    return {
      statusCode: 201,
      body: JSON.stringify(schedule),
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
