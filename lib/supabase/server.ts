import { createServerClient } from "@supabase/ssr";
import { cookies as getCookies } from "next/headers";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
type CookieStore = Awaited<ReturnType<typeof getCookies>>;
type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<CookieStore["set"]>[2];
};

export const createClient = async (
  cookieStore?: ReturnType<typeof getCookies>,
) => {
  const cookies = cookieStore ?? getCookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: async () => (await cookies).getAll(),
      setAll: (cookiesToSet: CookieToSet[]) => {
        try {
          cookiesToSet.forEach(async ({ name, value, options }) =>
            (await cookies).set(name, value, options),
          );
        } catch {
          console.error("Failed to set cookies:", cookiesToSet);
        }
      },
    },
  });
};
