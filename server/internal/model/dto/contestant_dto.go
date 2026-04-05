package dto

type ContestantUpsertRequest struct {
	Name         string  `json:"name" binding:"required"`
	DateOfBirth  string  `json:"dateOfBirth" binding:"required"`
	PhotoURL     *string `json:"photoURL"`
	Gender       string  `json:"gender" binding:"required"`
	AcademicYear string  `json:"academicYear" binding:"required"`
	Semester     string  `json:"semester" binding:"required"`
	NIC          *string `json:"nic"`
	StudentID    *string `json:"studentId"`
}
