# API Guide

The API follows REST conventions and is documented with **OpenAPI 3.0**. Every
service serves interactive Swagger UI at `/docs` and the raw spec at
`/openapi.json`. The gateway hosts an aggregated Swagger explorer at
`http://localhost:8080/docs`.

## 1. Conventions

| Verb | Usage |
| ---- | ----- |
| `GET` | Retrieve resource(s) |
| `POST` | Create a resource / perform an action |
| `PUT` | Full replacement update |
| `PATCH` | Partial update |
| `DELETE` | Remove a resource |

| Status | Meaning |
| ------ | ------- |
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (RBAC denial) |
| 404 | Not Found |
| 409 | Conflict (duplicate unique value) |
| 422 | Validation Error (field-level details) |
| 500 | Internal Server Error (generic, never leaks internals) |

### Response envelope

```jsonc
{ "success": true, "data": { }, "meta": { "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasNext": true, "hasPrev": false } } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed", "details": [ { "field": "body.email", "message": "A valid email is required" } ] } }
```

### Authentication

All protected endpoints require `Authorization: Bearer <accessToken>`. Obtain
tokens from `/auth/login` or `/auth/register`; refresh with `/auth/refresh`.

## 2. Worked examples (via the gateway, base `http://localhost:8080/api/v1`)

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tzw.com","password":"Password123!"}'
```

```jsonc
// 200
{ "success": true, "data": {
  "user": { "id": "…", "email": "admin@tzw.com", "role": "ADMIN" },
  "accessToken": "eyJ…", "refreshToken": "eyJ…", "expiresIn": 900 } }
```

### Register an extinguisher (ADMIN/INSPECTOR)

```bash
curl -X POST http://localhost:8080/api/v1/extinguishers \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"serialNumber":"FE-2001","location":"Warehouse A","type":"CO2","size":"5 lbs","installationDate":"2024-01-10","expiryDate":"2029-01-10"}'
```

```jsonc
// 201 → { "success": true, "data": { "id": "…", "serialNumber": "FE-2001", "status": "Active", … } }
// 409 → duplicate serial number
// 422 → { "error": { "code": "VALIDATION_ERROR", "details": [ { "field": "body.expiryDate", "message": "Expiry date must be after the installation date" } ] } }
```

### Search & paginate

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/extinguishers?type=CO2&status=Active&search=warehouse&page=1&limit=20&sortBy=expiry_date&sortDir=asc"
```

### Schedule an inspection

```bash
curl -X POST http://localhost:8080/api/v1/inspections \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"extinguisherId":"<uuid>","inspectionDate":"2026-07-01","inspectionTime":"09:00"}'
# 422 if the date is in the past; 409 if the slot is already taken
```

### Export a report

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/reports/export?type=compliance&format=pdf" -o compliance.pdf
```

## 3. Per-service specifications

| Service | Swagger UI | Spec file |
| ------- | ---------- | --------- |
| Auth | `http://localhost:4001/docs` | [`services/auth-service/openapi.yaml`](../services/auth-service/openapi.yaml) |
| Users | `http://localhost:4002/docs` | [`services/user-service/openapi.yaml`](../services/user-service/openapi.yaml) |
| Extinguishers | `http://localhost:4003/docs` | [`services/extinguisher-service/openapi.yaml`](../services/extinguisher-service/openapi.yaml) |
| Inspections | `http://localhost:4004/docs` | [`services/inspection-service/openapi.yaml`](../services/inspection-service/openapi.yaml) |
| Notifications | `http://localhost:4005/docs` | [`services/notification-service/openapi.yaml`](../services/notification-service/openapi.yaml) |
| Reporting | `http://localhost:4006/docs` | [`services/reporting-service/openapi.yaml`](../services/reporting-service/openapi.yaml) |

A full endpoint reference (verbs, validation, role requirements) is in
[Microservices Design](02-microservices-design.md).
