package infrastructure

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

// InitFirebase creates a Firebase Admin Auth client using Application Default Credentials.
//
// Credential resolution order (handled automatically by the SDK):
//   1. GOOGLE_APPLICATION_CREDENTIALS env var → service account JSON (local dev)
//   2. GCP runtime service account via Workload Identity / metadata server (Cloud Run, GKE)
//
// No explicit credential handling is needed here — the SDK and ADC manage it.
func InitFirebase(ctx context.Context) (*auth.Client, error) {
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("firebase app init failed: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("firebase auth client init failed: %w", err)
	}

	return authClient, nil
}
