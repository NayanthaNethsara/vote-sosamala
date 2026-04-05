-- name: CreateContestant :one
INSERT INTO contestants (name, date_of_birth, photo_url, gender, academic_year, semester)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, created_at, updated_at;

-- name: ListContestants :many
SELECT id, name, date_of_birth, photo_url, gender, academic_year, semester, created_at, updated_at
FROM contestants
ORDER BY created_at DESC;

-- name: UpdateContestant :one
UPDATE contestants
SET
  name = $2,
  date_of_birth = $3,
  photo_url = $4,
  gender = $5,
  academic_year = $6,
  semester = $7,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, date_of_birth, photo_url, gender, academic_year, semester, created_at, updated_at;

-- name: DeleteContestant :execrows
DELETE FROM contestants
WHERE id = $1;