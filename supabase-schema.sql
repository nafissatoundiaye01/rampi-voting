-- ============================================
-- RAMPI Vote - Schema Supabase
-- ============================================

-- Table des votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  show_results BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des options de vote
CREATE TABLE vote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des enregistrements de votes (historique)
CREATE TABLE vote_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES vote_options(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  -- Informations du votant
  voter_nom TEXT NOT NULL,
  voter_prenom TEXT NOT NULL,
  voter_email TEXT NOT NULL,
  voter_telephone TEXT NOT NULL,
  voter_pays TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des administrateurs
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Index pour les performances
-- ============================================

CREATE INDEX idx_vote_options_vote_id ON vote_options(vote_id);
CREATE INDEX idx_vote_records_vote_id ON vote_records(vote_id);
CREATE INDEX idx_vote_records_visitor_id ON vote_records(visitor_id);
CREATE INDEX idx_vote_records_email ON vote_records(voter_email);
CREATE INDEX idx_votes_dates ON votes(start_date, end_date);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politique pour votes: lecture publique, ecriture authentifiee
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Votes can be inserted by anyone"
  ON votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Votes can be updated by anyone"
  ON votes FOR UPDATE
  USING (true);

CREATE POLICY "Votes can be deleted by anyone"
  ON votes FOR DELETE
  USING (true);

-- Politique pour vote_options: lecture publique
CREATE POLICY "Vote options are viewable by everyone"
  ON vote_options FOR SELECT
  USING (true);

CREATE POLICY "Vote options can be inserted by anyone"
  ON vote_options FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Vote options can be updated by anyone"
  ON vote_options FOR UPDATE
  USING (true);

CREATE POLICY "Vote options can be deleted by anyone"
  ON vote_options FOR DELETE
  USING (true);

-- Politique pour vote_records
CREATE POLICY "Vote records are viewable by everyone"
  ON vote_records FOR SELECT
  USING (true);

CREATE POLICY "Vote records can be inserted by anyone"
  ON vote_records FOR INSERT
  WITH CHECK (true);

-- Politique pour admins
CREATE POLICY "Admins are viewable by everyone"
  ON admins FOR SELECT
  USING (true);

-- ============================================
-- Insertion de l'admin par defaut
-- ============================================

INSERT INTO admins (email, password_hash)
VALUES ('admin@rampi.com', 'admin123');

-- ============================================
-- Fonction pour incrementer le compteur de votes
-- ============================================

CREATE OR REPLACE FUNCTION increment_vote_count(option_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE vote_options
  SET votes_count = votes_count + 1
  WHERE id = option_uuid;
END;
$$ LANGUAGE plpgsql;
