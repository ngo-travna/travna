import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { gpxToSimplifiedLines } from "../lib/gpx-simplify";

// Generated once at build time: every trail's GPX is downloaded here,
// simplified, and written as one small static JSON file. The overview map on
// /trails loads this instead of downloading every full GPX in the browser.
export const GET: APIRoute = async () => {
  const { data: trails, error } = await supabase
    .from("trails")
    .select("slug, gpx_file")
    .not("gpx_file", "is", null);

  if (error) {
    console.error("Failed to fetch trails for overview map:", error);
  }

  const result: Record<string, [number, number][][]> = {};

  await Promise.all(
    (trails ?? []).map(async (trail) => {
      try {
        const response = await fetch(trail.gpx_file as string);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const lines = gpxToSimplifiedLines(await response.text());
        if (lines.length > 0) result[trail.slug] = lines;
      } catch (err) {
        console.warn(`Overview map: skipping ${trail.slug}:`, err);
      }
    }),
  );

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
};
