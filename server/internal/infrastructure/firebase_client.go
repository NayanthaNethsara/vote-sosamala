package infrastructure

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

// InitFirebase creates a Firebase Admin Auth client using Application Default Credentials.
// ProjectID is required so VerifyIDToken can validate the JWT audience claim.
func InitFirebase(ctx context.Context, projectID string) (*auth.Client, error) {
	app, err := firebase.NewApp(ctx, &firebase.Config{
		ProjectID: projectID,
	})
	if err != nil {
		return nil, fmt.Errorf("firebase app init failed: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("firebase auth client init failed: %w", err)
	}

	return authClient, nil
}
