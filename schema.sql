-- ============================================================
-- Citronics — Event Management Platform
-- PostgreSQL Schema
-- ============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
-- Roles: Owner | Admin | Head | Student
-- Owner  → full access
-- Admin  → manage events, speakers, venues, tickets
-- Head   → scoped to assigned events (see event_heads)
-- Student → register & view own tickets
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255)        NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone         VARCHAR(20),
    role          VARCHAR(20)  NOT NULL DEFAULT 'Student'
                               CHECK (role IN ('Owner','Admin','Head','Student')),
    status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','inactive','suspended')),
    avatar_url    TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. VENUES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    address       VARCHAR(255),
    city          VARCHAR(100),
    state         VARCHAR(100),
    country       VARCHAR(100) DEFAULT 'India',
    postal_code   VARCHAR(20),
    capacity      INTEGER,
    amenities     TEXT[],          -- e.g. ARRAY['Wi-Fi','Parking','AC']
    map_link      TEXT,
    contact_name  VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','inactive')),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. EVENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    category      VARCHAR(50)  NOT NULL DEFAULT 'other'
                               CHECK (category IN (
                                   'conference','workshop','concert','exhibition',
                                   'networking','sports','festival','webinar','other'
                               )),
    start_date    TIMESTAMP    NOT NULL,
    end_date      TIMESTAMP    NOT NULL,
    timezone      VARCHAR(60)  NOT NULL DEFAULT 'Asia/Kolkata',
    venue_id      INTEGER      REFERENCES venues(id) ON DELETE SET NULL,
    capacity      INTEGER,
    cover_image   TEXT,
    tags          TEXT[],
    is_free       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_public     BOOLEAN      NOT NULL DEFAULT TRUE,
    featured      BOOLEAN      NOT NULL DEFAULT FALSE,
    status        VARCHAR(20)  NOT NULL DEFAULT 'draft'
                               CHECK (status IN (
                                   'draft','published','cancelled','completed','postponed'
                               )),
    created_by    INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Backward-compat view used by dashboard queries (event_date → start_date alias)
CREATE OR REPLACE VIEW events_v AS
    SELECT *, start_date AS event_date FROM events;

-- ── 4. EVENT HEADS ───────────────────────────────────────────
-- Maps users with role='Head' to the events they manage
CREATE TABLE IF NOT EXISTS event_heads (
    id         SERIAL PRIMARY KEY,
    event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, user_id)
);

-- ── 5. SPEAKERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speakers (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    bio           TEXT,
    job_title     VARCHAR(150),
    company       VARCHAR(150),
    email         VARCHAR(255),
    phone         VARCHAR(20),
    photo_url     TEXT,
    linkedin_url  TEXT,
    twitter_handle VARCHAR(100),
    website       TEXT,
    expertise     TEXT[],       -- e.g. ARRAY['AI','Cloud','Security']
    featured      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. EVENT SPEAKERS ────────────────────────────────────────
-- A speaker can appear at multiple events; each appearance has its own session
CREATE TABLE IF NOT EXISTS event_speakers (
    id             SERIAL PRIMARY KEY,
    event_id       INTEGER NOT NULL REFERENCES events(id)   ON DELETE CASCADE,
    speaker_id     INTEGER NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
    session_title  VARCHAR(255),
    session_start  TIMESTAMP,
    session_end    TIMESTAMP,
    UNIQUE (event_id, speaker_id)
);

-- ── 7. TICKET TYPES ──────────────────────────────────────────
-- Each event can have multiple ticket types (e.g. Early Bird, General, VIP)
CREATE TABLE IF NOT EXISTS ticket_types (
    id               SERIAL PRIMARY KEY,
    event_id         INTEGER      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL,
    description      TEXT,
    price            DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity         INTEGER,          -- NULL = unlimited
    quantity_sold    INTEGER      NOT NULL DEFAULT 0,
    sale_start       TIMESTAMP,
    sale_end         TIMESTAMP,
    is_transferable  BOOLEAN      NOT NULL DEFAULT TRUE,
    per_order_min    INTEGER      NOT NULL DEFAULT 1,
    per_order_max    INTEGER,
    status           VARCHAR(20)  NOT NULL DEFAULT 'available'
                                  CHECK (status IN (
                                      'available','sold_out','paused','upcoming'
                                  )),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. REGISTRATIONS ─────────────────────────────────────────
-- One row per user × event purchase (may cover multiple tickets)
CREATE TABLE IF NOT EXISTS registrations (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES users(id)        ON DELETE RESTRICT,
    event_id         INTEGER      NOT NULL REFERENCES events(id)       ON DELETE RESTRICT,
    ticket_type_id   INTEGER      REFERENCES ticket_types(id)          ON DELETE SET NULL,
    quantity         INTEGER      NOT NULL DEFAULT 1,
    amount_paid      DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status   VARCHAR(20)  NOT NULL DEFAULT 'pending'
                                  CHECK (payment_status IN (
                                      'pending','paid','failed','refunded'
                                  )),
    payment_ref      VARCHAR(150),   -- gateway transaction / reference ID
    status           VARCHAR(20)  NOT NULL DEFAULT 'confirmed'
                                  CHECK (status IN (
                                      'confirmed','cancelled','waitlisted'
                                  )),
    notes            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 9. TICKETS ────────────────────────────────────────────────
-- Individual tickets issued per registration (one per seat/entry)
CREATE TABLE IF NOT EXISTS tickets (
    id               SERIAL PRIMARY KEY,
    registration_id  INTEGER      NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_id         INTEGER      NOT NULL REFERENCES events(id)         ON DELETE RESTRICT,
    ticket_type_id   INTEGER      REFERENCES ticket_types(id)            ON DELETE SET NULL,
    ticket_number    VARCHAR(50)  UNIQUE NOT NULL,
    qr_code          TEXT,
    attendee_name    VARCHAR(200),
    attendee_email   VARCHAR(255),
    status           VARCHAR(20)  NOT NULL DEFAULT 'sold'
                                  CHECK (status IN (
                                      'sold','used','cancelled','refunded'
                                  )),
    checked_in_at    TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_status       ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date   ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_venue_id     ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by   ON events(created_by);

CREATE INDEX IF NOT EXISTS idx_event_heads_user_id  ON event_heads(user_id);
CREATE INDEX IF NOT EXISTS idx_event_heads_event_id ON event_heads(event_id);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);

CREATE INDEX IF NOT EXISTS idx_registrations_user_id  ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment  ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_created  ON registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON tickets(registration_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id        ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status          ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number          ON tickets(ticket_number);

-- ── SEED DATA ────────────────────────────────────────────────
-- Default Owner account  (password: Admin@123)
-- Hash generated with: bcrypt.hashSync('Admin@123', 10)
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
    'admin@citronics.in',
    '$2a$10$X9z1h4e0ZkGJzFxwK4Qu5.omVQjrV9gBqwDXNF3MIVAnV0Wgt5T3u',
    'Admin', 'Citronics', 'Owner', 'active'
)
ON CONFLICT (email) DO NOTHING;

-- Sample venue
INSERT INTO venues (name, city, state, country, capacity, status)
VALUES ('Main Auditorium', 'Surat', 'Gujarat', 'India', 500, 'active')
ON CONFLICT DO NOTHING;
