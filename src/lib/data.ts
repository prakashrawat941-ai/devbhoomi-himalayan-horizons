import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const villagesQuery = queryOptions({
  queryKey: ["villages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("villages").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const cultureQuery = (slug: string) =>
  queryOptions({
    queryKey: ["culture", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("cultural_content").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const cultureListQuery = queryOptions({
  queryKey: ["culture"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cultural_content").select("id,slug,title,category,summary").order("title");
    if (error) throw error;
    return data;
  },
});

export const homestaysQuery = queryOptions({
  queryKey: ["homestays", "approved"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("homestays")
      .select("id,name,description,rooms,amenities,tariff_note,image_path,villages(name,district)")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export async function signedImage(path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("homestay-images").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
