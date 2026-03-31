package infrastructure

import (
	"fmt"

	"github.com/nats-io/nats.go"
)

// InitNATS initializes and returns a NATS connection.
func InitNATS(url string) (*nats.Conn, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS at %s: %w", url, err)
	}

	return nc, nil
}
