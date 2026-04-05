package main

import (
	"context"
	"log"
	"strings"

	"firebase.google.com/go/v4/auth"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/api/middleware"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/platform"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.FirebaseProjectID == "" {
		log.Fatal("FIREBASE_PROJECT_ID is required for setup bootstrap")
	}

	authClient, err := platform.InitFirebase(context.Background(), cfg.FirebaseProjectID)
	if err != nil {
		log.Fatalf("failed to initialize Firebase for setup bootstrap: %v", err)
	}

	email := strings.ToLower(strings.TrimSpace(cfg.BootstrapSuperAdminEmail))
	if email == "" {
		log.Println("BOOTSTRAP_SUPER_ADMIN_EMAIL is empty; skipping super-admin bootstrap")
		return
	}

	userRecord, err := authClient.GetUserByEmail(context.Background(), email)
	if err != nil {
		if auth.IsUserNotFound(err) {
			log.Fatalf("bootstrap email %s not found in Firebase Auth; user must sign in at least once", email)
		}
		log.Fatalf("failed to get bootstrap user by email: %v", err)
	}

	updatedClaims := make(map[string]interface{}, len(userRecord.CustomClaims)+1)
	for k, v := range userRecord.CustomClaims {
		updatedClaims[k] = v
	}
	updatedClaims["role"] = middleware.RoleSuperAdmin

	if err := authClient.SetCustomUserClaims(context.Background(), userRecord.UID, updatedClaims); err != nil {
		log.Fatalf("failed to set super-admin claim: %v", err)
	}

	log.Printf("super-admin role assigned to %s (%s)", email, userRecord.UID)
}
