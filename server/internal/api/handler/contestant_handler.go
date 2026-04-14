package handler

import (
	"net/http"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/dto"
	contestantrepo "github.com/NayanthaNethsara/vote-sosamala/server/internal/repository/contestant"
	contestantservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/contestant"
	"github.com/gin-gonic/gin"
)

type ContestantHandler struct {
	service *contestantservice.Service
}

func NewContestantHandler(service *contestantservice.Service) *ContestantHandler {
	return &ContestantHandler{service: service}
}

func (h *ContestantHandler) ListContestantsPublic(c *gin.Context) {
	contestants, err := h.service.List(c.Request.Context())
	if err != nil {
		respondContestantError(c, err)
		return
	}

	c.JSON(http.StatusOK, contestants)
}

func (h *ContestantHandler) CreateContestant(c *gin.Context) {
	var input dto.ContestantUpsertRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdContestant, err := h.service.Create(c.Request.Context(), contestantrepo.UpsertInput{
		Name:         input.Name,
		DateOfBirth:  input.DateOfBirth,
		PhotoURL:     input.PhotoURL,
		Gender:       input.Gender,
		AcademicYear: input.AcademicYear,
		Semester:     input.Semester,
		NIC:          input.NIC,
		StudentID:    input.StudentID,
	})
	if err != nil {
		respondContestantError(c, err)
		return
	}

	c.JSON(http.StatusCreated, createdContestant)
}

func (h *ContestantHandler) ListContestants(c *gin.Context) {
	contestants, err := h.service.List(c.Request.Context())
	if err != nil {
		respondContestantError(c, err)
		return
	}

	c.JSON(http.StatusOK, contestants)
}

func (h *ContestantHandler) UpdateContestant(c *gin.Context) {
	id := c.Param("id")

	var input dto.ContestantUpsertRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedContestant, err := h.service.Update(c.Request.Context(), id, contestantrepo.UpsertInput{
		Name:         input.Name,
		DateOfBirth:  input.DateOfBirth,
		PhotoURL:     input.PhotoURL,
		Gender:       input.Gender,
		AcademicYear: input.AcademicYear,
		Semester:     input.Semester,
		NIC:          input.NIC,
		StudentID:    input.StudentID,
	})
	if err != nil {
		respondContestantError(c, err)
		return
	}

	c.JSON(http.StatusOK, updatedContestant)
}

func (h *ContestantHandler) DeleteContestant(c *gin.Context) {
	id := c.Param("id")
	err := h.service.Delete(c.Request.Context(), id)
	if err != nil {
		respondContestantError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
