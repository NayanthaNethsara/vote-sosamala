ALTER TABLE contestants
    ADD COLUMN IF NOT EXISTS nic VARCHAR(50),
    ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);

UPDATE contestants
SET academic_year = split_part(academic_year, ' - ', 1)
WHERE academic_year LIKE '% - %';

UPDATE contestants
SET student_id = 'LEGACY-' || LEFT(id::text, 8)
WHERE NULLIF(BTRIM(COALESCE(nic, '')), '') IS NULL
    AND NULLIF(BTRIM(COALESCE(student_id, '')), '') IS NULL;

ALTER TABLE contestants
    ADD CONSTRAINT contestants_identification_required
    CHECK (
        NULLIF(BTRIM(COALESCE(nic, '')), '') IS NOT NULL
        OR NULLIF(BTRIM(COALESCE(student_id, '')), '') IS NOT NULL
    );

CREATE UNIQUE INDEX IF NOT EXISTS contestants_nic_unique_idx
    ON contestants (nic)
    WHERE nic IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contestants_student_id_unique_idx
    ON contestants (student_id)
    WHERE student_id IS NOT NULL;
