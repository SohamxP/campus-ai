import { useCallback, useEffect, useState } from "react";
import { CampusEvent, fetchEvents } from "@/api/events";

export function useEvents() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchEvents();
      setEvents(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load events";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: loadEvents,
  };
}