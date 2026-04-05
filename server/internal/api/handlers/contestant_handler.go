package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Contestant struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Birthday         *string   `json:"birthday"` // Format: YYYY-MM-DD
	NicOrStudentId   string    `json:"nicOrStudentId"`
	PhotoUrl         *string   `json:"photoUrl"`
	Gender           *string   `json:"gender"`
	AcademicYear     *string   `json:"academicYear"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type ContestantInput struct {
	Name           string  `json:"name" binding:"required"`
	Birthday       *string `json:"birthday"`
	NicOrStudentId string  `json:"nicOrStudentId" binding:"required"`
	PhotoUrl       *string `json:"photoUrl"`
	Gender         *string `json:"gender"`
	AcademicYear   *string `json:"academicYear"`
}

type ContestantHandler struct {
	db *pgxpool.Pool
}

func NewContestantHandler(db *pgxpool.Pool) *ContestantHandler {
	return &ContestantHandler{db: db}
}

func (h *ContestantHandler) CreateContestant(c *gin.Context) {
	var input ContestantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO contestants (name, birthday, nic_or_studentid, photo_url, gender, academic_year)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, birthday::text, nic_or_studentid, photo_url, gender, academic_year, created_at, updated_at
	`

	var cont Contestant
	err := h.db.QueryRow(context.Background(), query,
		input.Name, input.Birthday, input.NicOrStudentId, input.PhotoUrl, input.Gender, input.AcademicYear,
	).Scan(
		&cont.ID, &cont.Name, &cont.Birthday, &cont.NicOrStudentId, &cont.PhotoUrl, &cont.Gender, &cont.AcademicYear, &cont.CreatedAt, &cont.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contestant"})
		return
	}

	c.JSON(http.StatusCreated, cont)
}

func (h *ContestantHandler) ListContestants(c *gin.Context) {
	query := `
		SELECT id, name, birthday::text, nic_or_studentid, photo_url, gender, academic_year, created_at, updated_at
		FROM contestants ORDER BY created_at DESC
	`

	rows, err := h.db.Query(context.Background(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list contestants"})
		return
	}
	defer rows.Close()

	var contestants []Contestant
	for rows.Next() {
		var cont Contestant
		if err := rows.Scan(
			&cont.ID, &cont.Name, &cont.Birthday, &cont.NicOrStudentId, &cont.PhotoUrl, &cont.Gender, &cont.AcademicYear, &cont.CreatedAt, &cont.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse contestants"})
			return
		}
		contestants = append(contestants, cont)
	}

	if contestants == nil {
		contestants = []Contestant{} // Return empty array instead of null
	}
	c.JSON(http.StatusOK, contestants)
}

func (h *ContestantHandler) UpdateContestant(c *gin.Context) {
	id := c.Param("id")

	var input ContestantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE contestants
		SET name = $1, birthday = $2, nic_or_studentid = $3, photo_url = $4, gender = $5, academic_year = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING id, name, birthday::text, nic_or_studentid, photo_url, gender, academic_year, created_at, updated_at
	`

	var cont Contestant
	err := h.db.QueryRow(context.Background(), query,
		input.Name, input.Birthday, input.NicOrStudentId, input.PhotoUrl, input.Gender, input.AcademicYear, id,
	).Scan(
		&cont.ID, &cont.Name, &cont.Birthday, &cont.NicOrStudentId, &cont.PhotoUrl, &cont.Gender, &cont.AcademicYear, &cont.CreatedAt, &cont.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to update contestant or contestant not found"})
		return
	}

	c.JSON(http.StatusOK, cont)
}

func (h *ContestantHandler) DeleteContestant(c *gin.Context) {
	id := c.Param("id")

	query := `DELETE FROM contestants WHERE id = $1`
	commandTag, err := h.db.Exec(context.Background(), query, id)
	if err != nil || commandTag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contestant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
