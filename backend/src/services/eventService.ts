import { supabase } from "../config/supabase";

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

export type CreateEventInput = {
  title: string;
  description: string;
  location: string;
  event_date: string;
  category: string;
  organizer?: string;
};

const EVENT_SELECT =
  "id,title,description,location,event_date,category,organizer,created_by,created_at";

function normalizeEvent(row: any): CampusEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    event_date: row.event_date,
    category: row.category,
    organizer: row.organizer,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

function throwSupabaseError(action: string, error: any): never {
  console.log(`Supabase ${action} error:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  });

  const message = error?.message || `Supabase failed during ${action}`;
  const code = error?.code ? ` Code: ${error.code}` : "";
  const details = error?.details ? ` Details: ${error.details}` : "";
  const hint = error?.hint ? ` Hint: ${error.hint}` : "";

  throw new Error(`${message}.${code}${details}${hint}`);
}

export async function getEvents(): Promise<CampusEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("event_date", { ascending: true });

  if (error) {
    throwSupabaseError("getEvents", error);
  }

  return (data || []).map(normalizeEvent);
}

export async function getEventById(id: string): Promise<CampusEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwSupabaseError("getEventById", error);
  }

  if (!data) {
    return null;
  }

  return normalizeEvent(data);
}

export async function createEvent(
  input: CreateEventInput,
  userId?: string
): Promise<CampusEvent> {
  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        title: input.title,
        description: input.description,
        location: input.location,
        event_date: input.event_date,
        category: input.category,
        organizer: input.organizer || "CampusAI",
        created_by: userId || null,
      },
    ])
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throwSupabaseError("createEvent", error);
  }

  return normalizeEvent(data);
}