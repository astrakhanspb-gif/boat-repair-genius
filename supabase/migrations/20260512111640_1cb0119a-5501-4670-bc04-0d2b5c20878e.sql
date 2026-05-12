
CREATE TABLE public.site_texts (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_texts" ON public.site_texts FOR SELECT USING (true);
CREATE POLICY "admin insert site_texts" ON public.site_texts FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update site_texts" ON public.site_texts FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete site_texts" ON public.site_texts FOR DELETE USING (has_role(auth.uid(), 'admin'));
