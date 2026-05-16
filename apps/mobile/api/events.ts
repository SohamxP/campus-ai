import { API } from "./client";

export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  category: string;
  organizer: string | null;
  created_by: string | null;
  created_at: string;
};

export type CreateEventData = {
  title: string;
  description: string;
  location: string;
  event_date: string;
  category: string;
  organizer?: string;
};

export async function fetchEvents(): Promise<CampusEvent[]> {
  const response = await API.get("/events");
  return response.data.events;
}

export async function fetchEventById(id: string): Promise<CampusEvent> {
  const response = await API.get(`/events/${id}`);
  return response.data.event;
}

export async function createEvent(data: CreateEventData): Promise<CampusEvent> {
  const response = await API.post("/events", data);
  return response.data.event;
}