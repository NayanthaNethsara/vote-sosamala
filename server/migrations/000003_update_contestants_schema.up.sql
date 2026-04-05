ALTER TABLE contestants
    RENAME COLUMN birthday TO date_of_birth;

ALTER TABLE contestants
    DROP COLUMN IF EXISTS nic_or_student_id;

ALTER TABLE contestants
    ADD COLUMN IF NOT EXISTS semester VARCHAR(50);