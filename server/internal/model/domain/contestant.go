package domain

import "time"

type Contestant struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Birthday       *string   `json:"birthday"`
	NicOrStudentID string    `json:"nicOrStudentId"`
	PhotoURL       *string   `json:"photoUrl"`
	Gender         *string   `json:"gender"`
	AcademicYear   *string   `json:"academicYear"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
