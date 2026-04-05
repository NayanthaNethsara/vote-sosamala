DROP INDEX IF EXISTS contestants_student_id_unique_idx;
DROP INDEX IF EXISTS contestants_nic_unique_idx;

ALTER TABLE contestants
    DROP CONSTRAINT IF EXISTS contestants_identification_required;

ALTER TABLE contestants
    DROP COLUMN IF EXISTS student_id,
    DROP COLUMN IF EXISTS nic;
