# Contributing to Sosamala Voting

Thank you for your interest in contributing to the Sosamala Voting system! To maintain a clean and reliable codebase, please follow these guidelines.

## Development Workflow

1.  **Branching Strategy**:
    *   `main`: Stable production branch.
    *   `dev`: Development branch. All new work should be integrated here before merging to `main`.
    *   `feature/*` or `fix/*`: Specific branches for your changes. Create these from the `dev` branch.

2.  **Pull Requests**:
    *   Always target the `dev` branch for your pull requests.
    *   Ensure your code passes the CI pipeline checks (linting, formatting, and build).

## Coding Standards

### Backend (Golang)
- Use `go fmt ./...` to format your code.
- Ensure `go vet ./...` passes without errors.
- Follow the modular structure in `/internal`.

### Frontend (Next.js)
- Run `pnpm run format` to ensure your code matches the project style.
- Ensure `pnpm run lint` passes before submitting your changes.

## CI/CD Pipeline
The project uses GitHub Actions for continuous integration. The pipeline is triggered on pull requests to the `dev` branch and verifies:
- Path changes (`client/` vs `server/`).
- Code formatting and linting.
- Successful build of both components.

## License
By contributing to this repository, you agree that your contributions will be licensed under the MIT License.
