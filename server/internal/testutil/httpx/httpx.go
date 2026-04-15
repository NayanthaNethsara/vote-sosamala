package httpx

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

// PerformJSONRequest executes an HTTP request against a Gin engine and returns the recorder.
func PerformJSONRequest(t *testing.T, router *gin.Engine, method string, path string, body any) *httptest.ResponseRecorder {
	t.Helper()

	var requestBody []byte
	if body != nil {
		var err error
		requestBody, err = json.Marshal(body)
		require.NoError(t, err)
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(requestBody))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)

	return res
}

// DecodeJSON unmarshals a recorder response body into out.
func DecodeJSON[T any](t *testing.T, res *httptest.ResponseRecorder, out *T) {
	t.Helper()
	require.NoError(t, json.Unmarshal(res.Body.Bytes(), out))
}
