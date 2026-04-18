package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/model/dto"
	voteservice "github.com/NayanthaNethsara/vote-sosamala/server/internal/service/vote"
	"github.com/gin-gonic/gin"
)

type VoteHandler struct {
	service *voteservice.Service
}

func NewVoteHandler(service *voteservice.Service) *VoteHandler {
	return &VoteHandler{service: service}
}

func (h *VoteHandler) CastVote(c *gin.Context) {
	var input dto.CastVoteRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	firebaseUID := contextString(c, middleware.ContextKeyUID)
	err := h.service.CastVote(c.Request.Context(), firebaseUID, input.ContestantID)
	if err != nil {
		switch {
		case errors.Is(err, voteservice.ErrInvalidVoteInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, voteservice.ErrAlreadyVoted):
			c.JSON(http.StatusConflict, gin.H{"error": "you have already voted"})
		case errors.Is(err, voteservice.ErrVoteUnavailable):
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "vote service is unavailable"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to cast vote"})
		}
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"accepted": true,
		"message":  "vote accepted",
	})
}

func (h *VoteHandler) GetContestantVotes(c *gin.Context) {
	contestantID := c.Param("id")
	votes, err := h.service.GetContestantVoteCount(c.Request.Context(), contestantID)
	if err != nil {
		switch {
		case errors.Is(err, voteservice.ErrInvalidVoteInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, voteservice.ErrVoteUnavailable):
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "vote service is unavailable"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch vote count"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"contestantId": contestantID,
		"votes":        votes,
	})
}

func (h *VoteHandler) GetLeaderboard(c *gin.Context) {
	page := int64(1)
	if pageQuery := c.Query("page"); pageQuery != "" {
		if parsedPage, err := strconv.ParseInt(pageQuery, 10, 64); err == nil {
			page = parsedPage
		}
	}

	limit := int64(20)
	if limitQuery := c.Query("limit"); limitQuery != "" {
		if parsedLimit, err := strconv.ParseInt(limitQuery, 10, 64); err == nil {
			limit = parsedLimit
		}
	}

	leaderboard, err := h.service.GetLeaderboard(c.Request.Context(), page, limit)
	if err != nil {
		switch {
		case errors.Is(err, voteservice.ErrVoteUnavailable):
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "vote service is unavailable"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch leaderboard"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"results": leaderboard,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
		},
	})
}

func (h *VoteHandler) GetMyVoteStatus(c *gin.Context) {
	firebaseUID := contextString(c, middleware.ContextKeyUID)
	hasVoted, err := h.service.HasUserVoted(c.Request.Context(), firebaseUID)
	if err != nil {
		switch {
		case errors.Is(err, voteservice.ErrInvalidVoteInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, voteservice.ErrVoteUnavailable):
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "vote service is unavailable"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch vote status"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"hasVoted": hasVoted,
	})
}
