package main

import (
	"context"
	"log"

	"github.com/NayanthaNethsara/vote-sosamala/server/internal/config"
	"github.com/NayanthaNethsara/vote-sosamala/server/internal/platform"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.FirebaseProjectID == "" {
		log.Fatal("FIREBASE_PROJECT_ID is required for setup bootstrap")
	}

	_, err := platform.InitFirebase(context.Background(), cfg.FirebaseProjectID)
	if err != nil {
		log.Fatalf("failed to initialize Firebase for setup bootstrap: %v", err)
	}

	log.Println("Setup bootstrap initialized successfully. Add SuperAdmin creation logic here.")
}
