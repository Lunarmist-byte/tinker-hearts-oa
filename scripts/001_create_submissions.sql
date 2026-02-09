-- Create submissions table for Tinker Hearts
CREATE TABLE IF NOT EXISTS public.tinker_hearts_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary')),
  target_gender TEXT NOT NULL,
  pickup_line TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tinker_hearts_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "allow_public_insert" 
  ON public.tinker_hearts_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read (for admin panel)
CREATE POLICY "allow_public_read" 
  ON public.tinker_hearts_submissions 
  FOR SELECT 
  USING (true);

-- Create love calculations table
CREATE TABLE IF NOT EXISTS public.love_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name1 TEXT NOT NULL,
  name2 TEXT NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.love_calculations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "allow_public_insert_love" 
  ON public.love_calculations 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read (for admin panel)
CREATE POLICY "allow_public_read_love" 
  ON public.love_calculations 
  FOR SELECT 
  USING (true);
