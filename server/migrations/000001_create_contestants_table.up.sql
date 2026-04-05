CREATE TABLE IF NOT EXISTS contestants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    birthday DATE,
    nic_or_studentid VARCHAR(50) UNIQUE NOT NULL,
    photo_url TEXT,
    gender VARCHAR(20),
    academic_year VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
