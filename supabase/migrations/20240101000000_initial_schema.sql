-- Profile Tabelle
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_number TEXT UNIQUE,
  name TEXT,
  email TEXT,
  voice TEXT CHECK (voice IN ('soprano', 'contralto', 'tenor', 'baixo')),
  phone TEXT,
  street TEXT,
  zip TEXT,
  city TEXT,
  fee_class TEXT CHECK (fee_class IN ('normal', 'reduced', 'sponsor')),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'board', 'admin')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Tabelle
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('ensaio', 'concerto', 'workshop', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participations Tabelle
CREATE TABLE participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('sim', 'nao', 'talvez')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, event_id)
);

-- Fee Payments Tabelle
CREATE TABLE fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  fee_year INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations Tabelle
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  purpose TEXT,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Tabelle
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'planning',
  deadline DATE,
  budget DECIMAL(10,2),
  progress INTEGER DEFAULT 0,
  lead_name TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Tabelle
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'inquiry',
  level TEXT,
  amount DECIMAL(10,2),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions Tabelle
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
