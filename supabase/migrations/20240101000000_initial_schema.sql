-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  member_number TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,

  voice TEXT CHECK (voice IN ('soprano', 'contralto', 'tenor', 'baixo')),

  phone TEXT,
  street TEXT,
  zip TEXT,
  city TEXT,

  fee_class TEXT DEFAULT 'normal'
    CHECK (fee_class IN ('normal', 'reduced', 'sponsor')),

  role TEXT DEFAULT 'member'
    CHECK (role IN ('member', 'board', 'admin')),

  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- EVENTS
-- =========================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,

  type TEXT DEFAULT 'ensaio'
    CHECK (type IN ('ensaio', 'concerto', 'workshop', 'other')),

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  location TEXT,
  description TEXT,

  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (end_time > start_time)
);


-- =========================================================
-- PARTICIPATIONS
-- =========================================================
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'talvez'
    CHECK (status IN ('sim', 'nao', 'talvez')),

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(member_id, event_id)
);


-- =========================================================
-- FEE PAYMENTS
-- =========================================================
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),

  due_date DATE NOT NULL,
  fee_year INTEGER NOT NULL,

  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue')),

  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- DONATIONS
-- =========================================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  date DATE NOT NULL,

  donor_name TEXT,
  donor_email TEXT,

  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),

  purpose TEXT,

  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- PROJECTS
-- =========================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  description TEXT,

  type TEXT,

  status TEXT DEFAULT 'planning'
    CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),

  deadline DATE,

  budget NUMERIC(10,2) CHECK (budget >= 0),

  progress INTEGER DEFAULT 0
    CHECK (progress >= 0 AND progress <= 100),

  lead_name TEXT,

  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- PARTNERS
-- =========================================================
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,

  type TEXT,

  contact_person TEXT,
  email TEXT,
  phone TEXT,

  status TEXT DEFAULT 'inquiry'
    CHECK (status IN ('inquiry', 'active', 'inactive')),

  level TEXT,

  amount NUMERIC(10,2) CHECK (amount >= 0),

  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================
-- PUSH SUBSCRIPTIONS
-- =========================================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
