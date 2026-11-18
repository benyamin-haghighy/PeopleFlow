# Controller E2E tests

These tests exercise the application's HTTP layer for all six controllers in the current project:

| Test file | Controller | Main routes covered |
|---|---|---|
| `auth.e2e-spec.ts` | `AuthController` | register, create-manager, login, refresh |
| `attendance.e2e-spec.ts` | `AttendanceController` | checkin, checkout, attendance filter |
| `department-manager.e2e-spec.ts` | `ManagerDepartmentController` | create, list, get by id, update, delete |
| `department-employee.e2e-spec.ts` | `EmployeeDepartmentController` | list and get by id |
| `payroll-manager.e2e-spec.ts` | `ManagerController` | base salary, groups, group salary update, payroll filter/get/update |
| `payroll-employee.e2e-spec.ts` | `EmployeeController` | employee payroll filter and get by id |

## What is real and what is mocked?

- Requests go through a real Nest HTTP application and the actual controllers.
- The project's `ValidationPipe`, `ResponseInterceptor`, `FilterError`, route decorators, and actual `RoleGuard` are included.
- The database-backed service classes are mocked. These tests therefore do not need PostgreSQL or Redis and do not test SQL queries or the internal implementation of services.
- `TestJwtGuard` is a test-only replacement for JWT verification. It accepts `manager-test-token` and `employee-test-token`, assigns the corresponding test user to the request, and still lets the real `RoleGuard` enforce route roles. It does not verify real JWT signatures.

## Run

From the project root:

```bash
npm run test:e2e -- --runInBand
```

Run one controller suite:

```bash
npm run test:e2e -- --runInBand test/auth.e2e-spec.ts
npm run test:e2e -- --runInBand test/attendance.e2e-spec.ts
npm run test:e2e -- --runInBand test/department-manager.e2e-spec.ts
npm run test:e2e -- --runInBand test/department-employee.e2e-spec.ts
npm run test:e2e -- --runInBand test/payroll-manager.e2e-spec.ts
npm run test:e2e -- --runInBand test/payroll-employee.e2e-spec.ts
```

`test/e2e-support/create-e2e-app.ts` contains the shared test application setup. `test/jest-e2e.json` uses the project root so Jest can resolve both `test/` and `src/` files.
