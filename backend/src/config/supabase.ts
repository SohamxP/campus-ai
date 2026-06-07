import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeWebSocket = require("ws");

export const supabase = createClient(
  env.supabaseUrl || "https://placeholder.supabase.co",
  env.supabaseServiceRoleKey || "placeholder-service-role-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: NodeWebSocket,
    },
  }
);