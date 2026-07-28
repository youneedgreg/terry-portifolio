
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients are public" ON public.clients FOR SELECT USING (true);
CREATE POLICY "owner manages clients" ON public.clients FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER clients_touch BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social links are public" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "owner manages social links" ON public.social_links FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER social_links_touch BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.clients (name, sort_order) VALUES
  ('Vogue Italia', 0), ('Jacquemus', 1), ('Loewe', 2), ('Acne Studios', 3),
  ('Dries Van Noten', 4), ('The Row', 5), ('Hermès', 6), ('Zara Atelier', 7);

INSERT INTO public.social_links (platform, url, sort_order) VALUES
  ('Instagram', 'https://instagram.com', 0),
  ('TikTok', 'https://tiktok.com', 1),
  ('IMDb', 'https://imdb.com', 2);

INSERT INTO public.site_content (key, value) VALUES
  ('clients_title', 'Selected clients'),
  ('gallery_title', 'The Gallery'),
  ('gallery_intro', 'A complete archive of editorial, campaign and runway work.'),
  ('social_title', 'Elsewhere')
ON CONFLICT (key) DO NOTHING;
