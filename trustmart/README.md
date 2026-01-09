**completed 2.8 (Jan 8 2026)**
![Screenshot of Folder Structure](image-1.png)


# completed 2.8 (Jan 9 2026)

## Code Review Checklist

Before approving a PR, reviewers must ensure:

- Linting and build checks pass
- No console errors or warnings
- Feature works as expected
- Code is readable and well-structured
- Naming conventions are followed
- No security or sensitive data issues
- Proper screenshots or evidence attached

![alt text](image-2.png)

**completed 2.10 (Jan 9 2026)**
Stores actual environment-specific secrets (API keys, database URLs, tokens) used during local development.
This file is not committed to version control to prevent exposing sensitive data.

.env.example

Provides a template of required environment variables with placeholder values.
This file is committed to help other developers know which variables must be configured before running the project.
