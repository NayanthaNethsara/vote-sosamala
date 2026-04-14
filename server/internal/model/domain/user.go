package domain

import "time"

type User struct {
	FirebaseUID string    `json:"firebaseUid"`
	Email       string    `json:"email"`
	DisplayName string    `json:"displayName"`
	PhotoURL    *string   `json:"photoURL"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
