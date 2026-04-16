package dto

type CastVoteRequest struct {
	ContestantID string `json:"contestantId" binding:"required"`
}
