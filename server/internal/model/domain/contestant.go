package domain

import "time"

type Contestant struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	DateOfBirth  string    `json:"dateOfBirth"`
	PhotoURL     *string   `json:"photoURL"`
	Gender       string    `json:"gender"`
	AcademicYear string    `json:"academicYear"`
	Semester     string    `json:"semester"`
	NIC          *string   `json:"nic"`
	StudentID    *string   `json:"studentId"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
