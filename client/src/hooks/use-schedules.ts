import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

// We mostly calculate client-side, but we can store generated schedules if needed
// adhering to the requirement to generate all hooks.

export function useCreateSchedule() {
  return useMutation({
    mutationFn: async (data: { startTime: string; generatedAt: string }) => {
      // In a real app, we might save this to DB for analytics
      // For now, we follow the API contract
      const res = await fetch(api.schedules.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to save schedule");
      }
      
      return api.schedules.create.responses[201].parse(await res.json());
    },
  });
}
