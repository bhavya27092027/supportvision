-- =====================================================
-- SupportVision Complete Database Setup
-- Automatically create profiles when users sign up
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- FUNCTION: Automatically create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the signup
  RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES for better query performance
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON public.sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_invite_token ON public.sessions(invite_token);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time DESC);

-- Participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON public.participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_role ON public.participants(role);
CREATE INDEX IF NOT EXISTS idx_participants_is_active ON public.participants(connection_status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Recordings indexes
CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON public.recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON public.recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON public.recordings(created_at DESC);

-- Shared files indexes
CREATE INDEX IF NOT EXISTS idx_shared_files_session_id ON public.shared_files(session_id);
CREATE INDEX IF NOT EXISTS idx_shared_files_uploaded_by ON public.shared_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_shared_files_created_at ON public.shared_files(created_at DESC);

-- Session events indexes
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON public.session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_event_type ON public.session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON public.session_events(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;

-- Users can read their own profile, admins can read all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SESSIONS RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_select_own ON public.sessions;
DROP POLICY IF EXISTS sessions_insert_agent ON public.sessions;
DROP POLICY IF EXISTS sessions_update_own ON public.sessions;
DROP POLICY IF EXISTS sessions_delete_own ON public.sessions;
DROP POLICY IF EXISTS sessions_admin_all ON public.sessions;

-- Agent can see their own sessions, admin can see all
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Agents can create sessions
CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = auth.uid());

-- Agents can update their own sessions
CREATE POLICY "sessions_update_own" ON public.sessions
  FOR UPDATE TO authenticated
  USING (agent_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- PARTICIPANTS RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS participants_select_all ON public.participants;
DROP POLICY IF EXISTS participants_insert_all ON public.participants;
DROP POLICY IF EXISTS participants_update_all ON public.participants;

CREATE POLICY "participants_select_all" ON public.participants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "participants_insert_all" ON public.participants
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "participants_update_all" ON public.participants
  FOR UPDATE TO authenticated
  USING (true);

-- MESSAGES RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_select_all ON public.messages;
DROP POLICY IF EXISTS messages_insert_all ON public.messages;

CREATE POLICY "messages_select_all" ON public.messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "messages_insert_all" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- RECORDINGS RLS
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recordings_select_all ON public.recordings;
DROP POLICY IF EXISTS recordings_insert_agent ON public.recordings;
DROP POLICY IF EXISTS recordings_update_own ON public.recordings;

CREATE POLICY "recordings_select_all" ON public.recordings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "recordings_insert_agent" ON public.recordings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = recordings.session_id 
    AND sessions.agent_id = auth.uid()
  ));

CREATE POLICY "recordings_update_own" ON public.recordings
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = recordings.session_id
    AND s.agent_id = auth.uid()
  ));

-- SHARED FILES RLS
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shared_files_select_all ON public.shared_files;
DROP POLICY IF EXISTS shared_files_insert_all ON public.shared_files;
DROP POLICY IF EXISTS shared_files_delete_own ON public.shared_files;

CREATE POLICY "shared_files_select_all" ON public.shared_files
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "shared_files_insert_all" ON public.shared_files
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "shared_files_delete_own" ON public.shared_files
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = shared_files.session_id
    AND s.agent_id = auth.uid()
  ));

-- SESSION EVENTS RLS
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_events_select_all ON public.session_events;
DROP POLICY IF EXISTS session_events_insert_all ON public.session_events;

CREATE POLICY "session_events_select_all" ON public.session_events
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "session_events_insert_all" ON public.session_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =====================================================
-- FUNCTIONS: Updated at timestamp triggers
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS sessions_updated_at ON public.sessions;
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- GRANT permissions to authenticated users
-- =====================================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.sessions TO authenticated;
GRANT ALL ON public.participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.recordings TO authenticated;
GRANT ALL ON public.shared_files TO authenticated;
GRANT ALL ON public.session_events TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- Create a profile for existing users who don't have one
-- =====================================================
INSERT INTO public.profiles (id, name, email, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'agent')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
