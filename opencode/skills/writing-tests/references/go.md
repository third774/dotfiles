# Go Testing Patterns

Language-specific patterns for testing Go applications using the standard library, `testify`, and modern integration tools.

## Contents

- [The Pragmatic Assertion Strategy](#the-pragmatic-assertion-strategy)
- [Table-Driven Tests](#table-driven-tests-the-gold-standard)
- [Integration Testing (Testcontainers)](#integration-testing-testcontainers)
- [Mocking Strategies](#mocking-strategies)
- [Native Fuzzing](#native-fuzzing)
- [HTTP Handlers with httptest](#http-handlers-with-httptest)
- [Tooling Quick Reference](#tooling-quick-reference)

## The Pragmatic Assertion Strategy

Don't be a purist. Use tools where they help, but know their limits.

- **Use `testify/require`** for setup and errors (stop the test immediately).
- **Use `testify/assert`** for simple value checks (booleans, strings, counts).
- **Use `google/go-cmp`** for complex structs (superior diff output).

```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/google/go-cmp/cmp"
)

func TestUserProcessing(t *testing.T) {
    // SETUP
    // Use 'require' to fail fast if setup fails
    user, err := CreateUser("test@example.com")
    require.NoError(t, err, "Setup failed, stopping test")
    require.NotNil(t, user)

    // ACTION
    processedUser := Process(user)

    // ASSERTIONS
    // Use 'assert' for simple scalar values
    assert.Equal(t, "processed", processedUser.Status)
    assert.True(t, processedUser.IsActive)

    // Use 'go-cmp' for complex objects
    // Testify's output for large structs can be unreadable.
    // cmp.Diff shows exactly which field differs (-want +got)
    want := User{
        Email:    "test@example.com",
        Status:   "processed",
        IsActive: true,
        Metadata: map[string]string{"source": "web"},
    }

    if diff := cmp.Diff(want, processedUser); diff != "" {
        t.Errorf("Process() mismatch (-want +got):\n%s", diff)
    }
}
```

## Table-Driven Tests (The Gold Standard)

This is the dominant pattern in Go. Combine it with `t.Parallel()` for speed.

```go
func TestParseURL(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string // simplified for example
        wantErr string // use string to match partial error messages
    }{
        {
            name:  "valid http",
            input: "http://example.com",
            want:  "example.com",
        },
        {
            name:    "missing protocol",
            input:   "example.com",
            wantErr: "invalid URL",
        },
    }

    for _, tt := range tests {
        tt := tt // Capture variable for parallel execution
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()

            got, err := ParseURL(tt.input)

            if tt.wantErr != "" {
                require.Error(t, err)
                assert.Contains(t, err.Error(), tt.wantErr)
                return
            }

            require.NoError(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

## Integration Testing (Testcontainers)

Do not mock database drivers. It creates low-confidence tests. Use `testcontainers-go` to spin up real dependencies.

```go
import (
    "context"
    "testing"
    "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUserDAO(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration test")
    }

    ctx := context.Background()

    // Spin up real Postgres
    pgContainer, err := postgres.Run(ctx, "docker.io/postgres:16-alpine",
        postgres.WithDatabase("testdb"),
        postgres.WithUsername("user"),
        postgres.WithPassword("password"),
    )
    require.NoError(t, err)

    // Clean up container when test ends
    t.Cleanup(func() {
        pgContainer.Terminate(ctx)
    })

    // Get connection string and run assertions
    connStr, _ := pgContainer.ConnectionString(ctx, "sslmode=disable")
    // ... connect to DB and test ...
}
```

## Mocking Strategies

### 1. Interface Fakes (Preferred)

For internal logic, handwritten fakes are often cleaner than mock frameworks. They are type-safe and refactor-friendly.

```go
// Dependency Interface
type EmailSender interface {
    Send(to, msg string) error
}

// Handmade Fake
type FakeSender struct {
    SentMessages []string
}

func (f *FakeSender) Send(to, msg string) error {
    f.SentMessages = append(f.SentMessages, to)
    return nil
}

func TestRegistration(t *testing.T) {
    fake := &FakeSender{}
    svc := NewService(fake)

    svc.Register("user@example.com")

    assert.Equal(t, 1, len(fake.SentMessages))
    assert.Equal(t, "user@example.com", fake.SentMessages[0])
}
```

### 2. Testify Mocks (For External Libs)

Use `testify/mock` when the interface is huge or complex (e.g., AWS SDKs) and a handwritten fake is too much work.

```go
import "github.com/stretchr/testify/mock"

type MockS3 struct {
    mock.Mock
}

func (m *MockS3) GetObject(key string) ([]byte, error) {
    args := m.Called(key)
    return args.Get(0).([]byte), args.Error(1)
}

func TestDownload(t *testing.T) {
    m := new(MockS3)
    m.On("GetObject", "avatar.jpg").Return([]byte("data"), nil)

    // ... test logic ...

    m.AssertExpectations(t)
}
```

## Native Fuzzing

Use standard library fuzzing for parsers and validators. It finds edge cases (empty bytes, huge inputs) that humans miss.

```go
func FuzzJSONParser(f *testing.F) {
    f.Add("{\"foo\":\"bar\"}") // Seed corpus

    f.Fuzz(func(t *testing.T, jsonInput string) {
        val, err := Parse(jsonInput)

        if err == nil {
            // Property: Re-encoding should match input
            output, _ := Marshal(val)
            if jsonInput != output {
                t.Errorf("Roundtrip failure! Input: %q, Output: %q", jsonInput, output)
            }
        }
    })
}
```

## HTTP Handlers with `httptest`

```go
func TestHandleHealth(t *testing.T) {
    // Arrange
    req := httptest.NewRequest("GET", "/health", nil)
    w := httptest.NewRecorder()

    // Act
    HealthHandler(w, req)

    // Assert
    res := w.Result()
    assert.Equal(t, 200, res.StatusCode)

    // Helper for reading body
    body, _ := io.ReadAll(res.Body)
    assert.JSONEq(t, `{"status": "ok"}`, string(body))
}
```

## Tooling Quick Reference

| Tool                | Purpose        | Best Use Case                                   |
| ------------------- | -------------- | ----------------------------------------------- |
| **testify/assert**  | Assertions     | 90% of unit tests. Fast, readable.              |
| **testify/require** | Assertions     | Checking errors/nil before proceeding.          |
| **google/go-cmp**   | Comparison     | Complex structs, huge slices, map diffs.        |
| **testcontainers**  | Infrastructure | Database/Cache integration tests.               |
| **httptest**        | HTTP           | Testing API handlers without starting a server. |
| **testing.F**       | Fuzzing        | Robustness testing for inputs/parsers.          |
