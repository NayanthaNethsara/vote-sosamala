DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'contestants'
          AND column_name = 'nic_or_student_id'
    ) THEN
        ALTER TABLE contestants RENAME COLUMN nic_or_student_id TO nic_or_studentid;
    END IF;
END $$;
