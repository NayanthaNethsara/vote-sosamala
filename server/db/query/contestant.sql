-- name: CreateContestant :one
INSERT INTO contestants (name, birthday, nic_or_student_id, photo_url, gender, academic_year)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, name, COALESCE(birthday::text, '') AS birthday_text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at;

-- name: ListContestants :many
SELECT id, name, COALESCE(birthday::text, '') AS birthday_text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at
FROM contestants
ORDER BY created_at DESC;

-- name: UpdateContestant :one
UPDATE contestants
SET
  name = $2,
  birthday = $3,
  nic_or_student_id = $4,
  photo_url = $5,
  gender = $6,
  academic_year = $7,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, COALESCE(birthday::text, '') AS birthday_text, nic_or_student_id, photo_url, gender, academic_year, created_at, updated_at;

-- name: DeleteContestant :execrows
DELETE FROM contestants
WHERE id = $1;