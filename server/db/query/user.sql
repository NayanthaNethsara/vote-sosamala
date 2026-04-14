-- name: UpsertUser :one
INSERT INTO users (firebase_uid, email, display_name, photo_url, role, last_login_at)
VALUES ($1, $2, $3, $4, $5, NOW())
ON CONFLICT (firebase_uid) DO UPDATE SET
    email         = EXCLUDED.email,
    display_name  = EXCLUDED.display_name,
    photo_url     = EXCLUDED.photo_url,
    role          = EXCLUDED.role,
    last_login_at = NOW(),
    updated_at    = NOW()
RETURNING firebase_uid, email, display_name, photo_url, role, last_login_at, created_at, updated_at;

-- name: GetUserByFirebaseUID :one
SELECT firebase_uid, email, display_name, photo_url, role, last_login_at, created_at, updated_at
FROM users
WHERE firebase_uid = $1;

-- name: UpdateUserRole :one
UPDATE users
SET role = $2, updated_at = NOW()
WHERE firebase_uid = $1
RETURNING firebase_uid, email, display_name, photo_url, role, last_login_at, created_at, updated_at;

-- name: ListAllUsers :many
SELECT firebase_uid, email, display_name, photo_url, role, last_login_at, created_at, updated_at
FROM users
ORDER BY created_at DESC;
