# Project Overview

This project is a Node.js backend API, for analytics or reporting, with "insights", "retailer", and "lilypad" modules, as well as various report and query files. It is organized for modularity, scalability, and maintainability. The main purpose of this API is to be a proxy between the frontend application and druid for analytics query.

## 1. Project Structure

Here’s a breakdown of the main directories and their purposes:

### Root Level

- **azure-pipeline-rollback.yaml / azure-pipelines.yml**: CI/CD pipeline definitions for Azure DevOps.
- **CONTRIBUTING.md**: Guidelines for contributing to the project.
- **data/**: Contains JSON files, likely for seed data, test data, or static reference data.
- **kube-config/**: Kubernetes configuration files for different environments (dev, prd, canary, etc.).
- **scripts/**: Utility scripts for integration setup/teardown and query management.

### `src/` — Main Application Code

- **app.ts**: Likely the main entry point for the Express app.
- **main.ts**: Possibly the bootstrap file for starting the server.

#### Submodules

- **dev/**: Development/test endpoints and utilities.
- **insights/**: Handles analytics or insights-related endpoints, with controllers, middleware, routers, queries, report strategies, and validators.
- **retailer/**: Handles retailer-specific endpoints, queries, reports, and validators.
- **lilypad/**: Another domain module, similar in structure to `insights` and `retailer`, with its own controllers, routers, queries, reports, and validators.

#### Shared Libraries

- **lib/**: Contains shared utilities and services:
  - **auth/**: Authentication middleware and utilities.
  - **config/**: Environment configuration.
  - **druid/**: Likely integration with Apache Druid (analytics database).
  - **errors/**: Error handling utilities.
  - **http/**: HTTP client and time utilities.
  - **instrumentation/**: Observability and monitoring.
  - **logger/**: Logging utilities.
  - **swagger/**: API documentation setup.
  - **validation/**: Validation middleware and utilities.

#### Types

- **types/**: Custom TypeScript type definitions, e.g., for Express.

### `tests/` — Testing

- **integration/**: Integration tests, organized by domain (retailer, lilypad, etc.).
- **unit/**: Unit tests, organized by module.

---

## 2. Coding Style

- **Language**: TypeScript is used throughout for type safety and maintainability.
- **Modularity**: Code is organized by domain (retailer, insights, lilypad), each with its own controllers, routers, queries, reports, and validators.
- **Separation of Concerns**: Clear separation between:
  - Controllers (handle HTTP requests)
  - Routers (define routes)
  - Middleware (cross-cutting concerns like auth, validation)
  - Queries (data access logic)
  - Reports (business logic for report generation)
  - Validators (input validation)
- **Naming Conventions**:
  - Files and folders use `camelCase` or `kebab-case`.
  - TypeScript interfaces and types use `PascalCase`.
  - Test files end with `.test.ts`.
- **Error Handling**: Centralized error handling via middleware in `lib/errors/`.
- **Validation**: Input validation is handled via dedicated validator files and middleware.
- **Configuration**: Environment-specific configuration is managed in `lib/config/env.ts` and Kubernetes configs.

---

## 3. Best Practices

- **Testing**: Both unit and integration tests are present, organized by module for clarity.
- **Environment Management**: Uses environment variables and Kubernetes configs for deployment flexibility.
- **CI/CD**: Automated pipelines via Azure DevOps YAML files.
- **Documentation**: Swagger integration for API docs, and a `CONTRIBUTING.md` for onboarding contributors.
- **Security**: Authentication middleware and utilities in `lib/auth/`.
- **Observability**: Instrumentation and logging are handled in dedicated modules.
- **Extensibility**: New domains (like `lilypad`) can be added with their own controllers, routers, queries, etc., following the existing structure.

---

## 4. How to Extend or Contribute

- **Add a new feature**: Create a new folder under `src/` for your domain, and follow the pattern: controller, router, queries, reports, validators.
- **Add a new report/query**: Place the logic in the appropriate `query/` or `report/` subfolder, and register it in the relevant factory/index file.
- **Add validation**: Implement a validator in the relevant `validators/` subfolder and wire it up in the router or controller.
- **Write tests**: Place unit tests in `tests/unit/` and integration tests in `tests/integration/`, mirroring the source structure.
- **Update documentation**: Add or update Swagger docs and `CONTRIBUTING.md` as needed.

---

## 5. Example: Adding a New Retailer Report

1. **Create Query**: `src/retailer/query/newReport.query.ts`
2. **Create Report Logic**: `src/retailer/retailerReports/newReport.report.ts`
3. **Add Validator**: `src/retailer/validators/newReport.validator.ts`
4. **Register in Factory**: Update `retailerReport.factory.ts` to include your new report.
5. **Add Route**: Update `retailer.router.ts` to add a new endpoint.
6. **Write Tests**: Add tests in `tests/unit/retailerReports/` and `tests/integration/retailer/`.

## 6. Some other tiny practices

- **Do not hard code http status number**: use the package "http-status-codes" while returning status, do not hardcode it.
- **Use proper payload validation**: When recieving payloads(body or query) through http requests, make sure to use the 'zod' library to properly validate its type and value.
