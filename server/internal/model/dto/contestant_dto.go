package dto

type ContestantUpsertRequest struct {
	Name           string  `json:"name" binding:"required"`
	Birthday       *string `json:"birthday"`
	NicOrStudentID string  `json:"nicOrStudentId" binding:"required"`
	PhotoURL       *string `json:"photoUrl"`
	Gender         *string `json:"gender"`
	AcademicYear   *string `json:"academicYear"`
}
