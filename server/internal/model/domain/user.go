package domain

import "time"

type User struct {
	FirebaseUID string     `json:"firebaseUid"`
	Email       string     `json:"email"`
	DisplayName string     `json:"displayName"`
	PhotoURL    *string    `json:"photoURL"`
	Role        string     `json:"role"`
	LastLoginAt *time.Time `json:"lastLoginAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
