package infrastructure

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// InitFirebase creates a Firebase Admin Auth client.
// In local dev, it reads GOOGLE_APPLICATION_CREDENTIALS from the environment.
// In GCP/production, it uses Application Default Credentials automatically.
func InitFirebase(ctx context.Context) (*auth.Client, error) {
	var app *firebase.App
	var err error

	credentialsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credentialsFile != "" {
		app, err = firebase.NewApp(ctx, nil, option.WithCredentialsFile(credentialsFile))
	} else {
		// Falls back to Application Default Credentials (works on GCP)
		app, err = firebase.NewApp(ctx, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase Auth client: %w", err)
	}

	return authClient, nil
}
