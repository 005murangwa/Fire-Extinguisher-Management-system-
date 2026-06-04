--
-- PostgreSQL database dump
--

\restrict ZksRmq2NI0chab4FnuMelgiU9l0lOzK9RFRktxGrw4OKnBvUpnIjLRfaZU7Efmj

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS fems_db;
--
-- Name: fems_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE fems_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE fems_db OWNER TO postgres;

\unrestrict ZksRmq2NI0chab4FnuMelgiU9l0lOzK9RFRktxGrw4OKnBvUpnIjLRfaZU7Efmj
\connect fems_db
\restrict ZksRmq2NI0chab4FnuMelgiU9l0lOzK9RFRktxGrw4OKnBvUpnIjLRfaZU7Efmj

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: asset; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA asset;


ALTER SCHEMA asset OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: customer; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA customer;


ALTER SCHEMA customer OWNER TO postgres;

--
-- Name: notification; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA notification;


ALTER SCHEMA notification OWNER TO postgres;

--
-- Name: reporting; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA reporting;


ALTER SCHEMA reporting OWNER TO postgres;

--
-- Name: service_request; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA service_request;


ALTER SCHEMA service_request OWNER TO postgres;

--
-- Name: AssetStatus; Type: TYPE; Schema: asset; Owner: postgres
--

CREATE TYPE asset."AssetStatus" AS ENUM (
    'Active',
    'ExpiringSoon',
    'Expired',
    'Serviced',
    'NeedsReplacement',
    'HighRisk'
);


ALTER TYPE asset."AssetStatus" OWNER TO postgres;

--
-- Name: ExtinguisherSize; Type: TYPE; Schema: asset; Owner: postgres
--

CREATE TYPE asset."ExtinguisherSize" AS ENUM (
    'lb1_5',
    'lb5',
    'lb9',
    'lb12'
);


ALTER TYPE asset."ExtinguisherSize" OWNER TO postgres;

--
-- Name: ExtinguisherType; Type: TYPE; Schema: asset; Owner: postgres
--

CREATE TYPE asset."ExtinguisherType" AS ENUM (
    'Water',
    'CO2',
    'Foam',
    'DryChemical'
);


ALTER TYPE asset."ExtinguisherType" OWNER TO postgres;

--
-- Name: MaintenanceTaskStatus; Type: TYPE; Schema: asset; Owner: postgres
--

CREATE TYPE asset."MaintenanceTaskStatus" AS ENUM (
    'Pending',
    'Assigned',
    'InProgress',
    'Completed'
);


ALTER TYPE asset."MaintenanceTaskStatus" OWNER TO postgres;

--
-- Name: AuditAction; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth."AuditAction" AS ENUM (
    'SIGNUP',
    'LOGIN',
    'LOGIN_FAILED',
    'LOGOUT',
    'OTP_SENT',
    'OTP_VERIFIED',
    'OTP_FAILED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    'PASSWORD_CHANGED',
    'PROFILE_UPDATED',
    'ACCOUNT_DEACTIVATED',
    'USER_INVITED'
);


ALTER TYPE auth."AuditAction" OWNER TO postgres;

--
-- Name: OtpPurpose; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth."OtpPurpose" AS ENUM (
    'signup',
    'login',
    'password_reset',
    'purchase',
    'sensitive_action'
);


ALTER TYPE auth."OtpPurpose" OWNER TO postgres;

--
-- Name: RoleName; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth."RoleName" AS ENUM (
    'Admin',
    'Inspector',
    'User',
    'Staff',
    'Technician',
    'Customer'
);


ALTER TYPE auth."RoleName" OWNER TO postgres;

--
-- Name: CustomerType; Type: TYPE; Schema: customer; Owner: postgres
--

CREATE TYPE customer."CustomerType" AS ENUM (
    'individual',
    'business',
    'institution'
);


ALTER TYPE customer."CustomerType" OWNER TO postgres;

--
-- Name: NotificationCategory; Type: TYPE; Schema: notification; Owner: postgres
--

CREATE TYPE notification."NotificationCategory" AS ENUM (
    'Order',
    'Invoice',
    'Asset',
    'Service',
    'Escalation',
    'Expiry',
    'System'
);


ALTER TYPE notification."NotificationCategory" OWNER TO postgres;

--
-- Name: NotificationChannel; Type: TYPE; Schema: notification; Owner: postgres
--

CREATE TYPE notification."NotificationChannel" AS ENUM (
    'Email',
    'SMS',
    'InApp'
);


ALTER TYPE notification."NotificationChannel" OWNER TO postgres;

--
-- Name: NotificationStatus; Type: TYPE; Schema: notification; Owner: postgres
--

CREATE TYPE notification."NotificationStatus" AS ENUM (
    'Pending',
    'Sent',
    'Failed',
    'Delivered',
    'Acknowledged'
);


ALTER TYPE notification."NotificationStatus" OWNER TO postgres;

--
-- Name: ExportFormat; Type: TYPE; Schema: reporting; Owner: postgres
--

CREATE TYPE reporting."ExportFormat" AS ENUM (
    'pdf',
    'csv',
    'xlsx'
);


ALTER TYPE reporting."ExportFormat" OWNER TO postgres;

--
-- Name: ReportStatus; Type: TYPE; Schema: reporting; Owner: postgres
--

CREATE TYPE reporting."ReportStatus" AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE reporting."ReportStatus" OWNER TO postgres;

--
-- Name: ReportType; Type: TYPE; Schema: reporting; Owner: postgres
--

CREATE TYPE reporting."ReportType" AS ENUM (
    'sales',
    'customers',
    'inventory',
    'low_stock',
    'expired_assets',
    'expiring_soon',
    'service_requests',
    'notifications',
    'invoices',
    'escalations',
    'inventory_total',
    'inventory_daily',
    'inventory_monthly',
    'inventory_yearly',
    'inspection_pending',
    'inspection_completed',
    'inspection_overdue',
    'compliance_expired',
    'compliance_upcoming',
    'compliance_status',
    'maintenance_history',
    'maintenance_frequency',
    'maintenance_recent'
);


ALTER TYPE reporting."ReportType" OWNER TO postgres;

--
-- Name: ServiceRequestStatus; Type: TYPE; Schema: service_request; Owner: postgres
--

CREATE TYPE service_request."ServiceRequestStatus" AS ENUM (
    'Pending',
    'Assigned',
    'InProgress',
    'Completed',
    'Cancelled'
);


ALTER TYPE service_request."ServiceRequestStatus" OWNER TO postgres;

--
-- Name: ServiceRequestType; Type: TYPE; Schema: service_request; Owner: postgres
--

CREATE TYPE service_request."ServiceRequestType" AS ENUM (
    'Refill',
    'Inspection',
    'Replacement',
    'TechnicianVisit'
);


ALTER TYPE service_request."ServiceRequestType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_histories; Type: TABLE; Schema: asset; Owner: postgres
--

CREATE TABLE asset.asset_histories (
    id text NOT NULL,
    "assetId" text NOT NULL,
    "eventType" text NOT NULL,
    description text NOT NULL,
    "oldStatus" asset."AssetStatus",
    "newStatus" asset."AssetStatus",
    metadata jsonb,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE asset.asset_histories OWNER TO postgres;

--
-- Name: asset_service_records; Type: TABLE; Schema: asset; Owner: postgres
--

CREATE TABLE asset.asset_service_records (
    id text NOT NULL,
    "assetId" text NOT NULL,
    "serviceType" text NOT NULL,
    "actionTaken" text,
    "issuesIdentified" text,
    recommendations text,
    "serviceDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "technicianId" text,
    "technicianName" text,
    notes text,
    "nextServiceDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE asset.asset_service_records OWNER TO postgres;

--
-- Name: asset_user_assignments; Type: TABLE; Schema: asset; Owner: postgres
--

CREATE TABLE asset.asset_user_assignments (
    id text NOT NULL,
    asset_id text NOT NULL,
    user_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE asset.asset_user_assignments OWNER TO postgres;

--
-- Name: fire_extinguisher_assets; Type: TABLE; Schema: asset; Owner: postgres
--

CREATE TABLE asset.fire_extinguisher_assets (
    id text NOT NULL,
    "assetCode" text NOT NULL,
    "customerId" text DEFAULT '00000000-0000-4000-8000-000000000000'::text NOT NULL,
    "productId" text DEFAULT 'manual'::text NOT NULL,
    "productName" text,
    "orderId" text,
    "invoiceId" text,
    "serialNumber" text NOT NULL,
    location text NOT NULL,
    "extinguisherType" asset."ExtinguisherType" NOT NULL,
    size asset."ExtinguisherSize" NOT NULL,
    "installationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "purchaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "installationLocation" text,
    "serviceDate" timestamp(3) without time zone,
    "nextServiceDate" timestamp(3) without time zone,
    "expirationDate" timestamp(3) without time zone NOT NULL,
    "refillBookedAt" timestamp(3) without time zone,
    status asset."AssetStatus" DEFAULT 'Active'::asset."AssetStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE asset.fire_extinguisher_assets OWNER TO postgres;

--
-- Name: maintenance_tasks; Type: TABLE; Schema: asset; Owner: postgres
--

CREATE TABLE asset.maintenance_tasks (
    id text NOT NULL,
    task_number text NOT NULL,
    asset_id text NOT NULL,
    source_inspection_id text,
    issue_identified text NOT NULL,
    action_required text,
    recommendation text,
    assigned_to_id text,
    assigned_to_name text,
    status asset."MaintenanceTaskStatus" DEFAULT 'Pending'::asset."MaintenanceTaskStatus" NOT NULL,
    maintenance_date timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE asset.maintenance_tasks OWNER TO postgres;

--
-- Name: auth_audit_logs; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.auth_audit_logs (
    id text NOT NULL,
    user_id text,
    action auth."AuditAction" NOT NULL,
    ip_address text,
    user_agent text,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth.auth_audit_logs OWNER TO postgres;

--
-- Name: otps; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.otps (
    id text NOT NULL,
    user_id text NOT NULL,
    destination text NOT NULL,
    code_hash text NOT NULL,
    purpose auth."OtpPurpose" NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    verified_at timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth.otps OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth.password_reset_tokens OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.roles (
    id text NOT NULL,
    name auth."RoleName" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE auth.roles OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.user_roles (
    user_id text NOT NULL,
    role_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id text NOT NULL,
    email text NOT NULL,
    google_id text,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    full_name text NOT NULL,
    phone_number text,
    is_email_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    customer_id text,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    profile_image_url text
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: customer_addresses; Type: TABLE; Schema: customer; Owner: postgres
--

CREATE TABLE customer.customer_addresses (
    id text NOT NULL,
    "customerId" text NOT NULL,
    label text,
    street text NOT NULL,
    city text NOT NULL,
    state text,
    "postalCode" text,
    country text DEFAULT 'Kenya'::text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE customer.customer_addresses OWNER TO postgres;

--
-- Name: customer_notes; Type: TABLE; Schema: customer; Owner: postgres
--

CREATE TABLE customer.customer_notes (
    id text NOT NULL,
    "customerId" text NOT NULL,
    content text NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE customer.customer_notes OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: customer; Owner: postgres
--

CREATE TABLE customer.customers (
    id text NOT NULL,
    "fullName" text NOT NULL,
    "nationalIdOrPassport" text,
    "phoneNumber" text NOT NULL,
    email text NOT NULL,
    "physicalAddress" text,
    "customerType" customer."CustomerType" DEFAULT 'individual'::customer."CustomerType" NOT NULL,
    "userId" text,
    notes text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE customer.customers OWNER TO postgres;

--
-- Name: expiry_alert_trackers; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.expiry_alert_trackers (
    id text NOT NULL,
    "assetId" text NOT NULL,
    "assetCode" text NOT NULL,
    "customerId" text NOT NULL,
    "userId" text,
    "expirationDate" timestamp(3) without time zone NOT NULL,
    "customerSeenAt" timestamp(3) without time zone,
    "refillBookedAt" timestamp(3) without time zone,
    "alertsResolvedAt" timestamp(3) without time zone,
    "lastReminderSentAt" timestamp(3) without time zone,
    "policeReportSent" boolean DEFAULT false NOT NULL,
    "alert30Sent" boolean DEFAULT false NOT NULL,
    "alert7Sent" boolean DEFAULT false NOT NULL,
    "alertOnExpirySent" boolean DEFAULT false NOT NULL,
    "alertOverdueSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE notification.expiry_alert_trackers OWNER TO postgres;

--
-- Name: notification_logs; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.notification_logs (
    id text NOT NULL,
    "notificationId" text NOT NULL,
    action text NOT NULL,
    channel notification."NotificationChannel" NOT NULL,
    detail text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE notification.notification_logs OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.notification_templates (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    channel notification."NotificationChannel" NOT NULL,
    subject text,
    body text NOT NULL,
    "htmlBody" text,
    "eventType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE notification.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.notifications (
    id text NOT NULL,
    "userId" text,
    "customerId" text,
    "recipientEmail" text,
    "recipientPhone" text,
    channel notification."NotificationChannel" NOT NULL,
    category notification."NotificationCategory" DEFAULT 'System'::notification."NotificationCategory" NOT NULL,
    subject text,
    body text NOT NULL,
    status notification."NotificationStatus" DEFAULT 'Pending'::notification."NotificationStatus" NOT NULL,
    "eventType" text,
    "eventPayload" jsonb,
    "templateId" text,
    "seenAt" timestamp(3) without time zone,
    "acknowledgedAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "failureReason" text,
    "resendCount" integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE notification.notifications OWNER TO postgres;

--
-- Name: generated_reports; Type: TABLE; Schema: reporting; Owner: postgres
--

CREATE TABLE reporting.generated_reports (
    id text NOT NULL,
    "reportType" reporting."ReportType" NOT NULL,
    title text NOT NULL,
    status reporting."ReportStatus" DEFAULT 'pending'::reporting."ReportStatus" NOT NULL,
    "rowCount" integer DEFAULT 0 NOT NULL,
    summary jsonb,
    "dataSnapshot" jsonb,
    "generatedBy" text,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE reporting.generated_reports OWNER TO postgres;

--
-- Name: report_exports; Type: TABLE; Schema: reporting; Owner: postgres
--

CREATE TABLE reporting.report_exports (
    id text NOT NULL,
    "generatedReportId" text NOT NULL,
    format reporting."ExportFormat" NOT NULL,
    "filePath" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE reporting.report_exports OWNER TO postgres;

--
-- Name: report_filters; Type: TABLE; Schema: reporting; Owner: postgres
--

CREATE TABLE reporting.report_filters (
    id text NOT NULL,
    "generatedReportId" text NOT NULL,
    "dateFrom" timestamp(3) without time zone,
    "dateTo" timestamp(3) without time zone,
    "customerId" text,
    "productType" text,
    status text,
    "technicianId" text,
    "paymentStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE reporting.report_filters OWNER TO postgres;

--
-- Name: service_completions; Type: TABLE; Schema: service_request; Owner: postgres
--

CREATE TABLE service_request.service_completions (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    "technicianId" text NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    summary text NOT NULL,
    "workPerformed" text,
    "partsUsed" text,
    "nextServiceDate" timestamp(3) without time zone,
    "nextExpirationDate" timestamp(3) without time zone,
    "inspectionResult" text,
    "maintenanceRequired" boolean DEFAULT false NOT NULL
);


ALTER TABLE service_request.service_completions OWNER TO postgres;

--
-- Name: service_notes; Type: TABLE; Schema: service_request; Owner: postgres
--

CREATE TABLE service_request.service_notes (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    content text NOT NULL,
    "createdBy" text,
    "authorRole" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE service_request.service_notes OWNER TO postgres;

--
-- Name: service_requests; Type: TABLE; Schema: service_request; Owner: postgres
--

CREATE TABLE service_request.service_requests (
    id text NOT NULL,
    "requestNumber" text NOT NULL,
    "customerId" text NOT NULL,
    "assetId" text NOT NULL,
    "requestedByUserId" text,
    type service_request."ServiceRequestType" NOT NULL,
    status service_request."ServiceRequestStatus" DEFAULT 'Pending'::service_request."ServiceRequestStatus" NOT NULL,
    description text,
    "scheduledDate" timestamp(3) without time zone,
    "scheduledTime" text,
    "notifyUserId" text,
    priority text DEFAULT 'normal'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE service_request.service_requests OWNER TO postgres;

--
-- Name: technician_assignments; Type: TABLE; Schema: service_request; Owner: postgres
--

CREATE TABLE service_request.technician_assignments (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    "technicianId" text NOT NULL,
    "technicianName" text,
    "assignedBy" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE service_request.technician_assignments OWNER TO postgres;

--
-- Data for Name: asset_histories; Type: TABLE DATA; Schema: asset; Owner: postgres
--

COPY asset.asset_histories (id, "assetId", "eventType", description, "oldStatus", "newStatus", metadata, "createdBy", "createdAt") FROM stdin;
2a8d6940-9b6a-45a9-b2d5-7a9e568163d7	c1000000-0001-4000-8000-000000000001	SEEDED	Demo extinguisher registered via database seed	\N	Active	\N	b1000000-0001-4000-8000-000000000001	2026-06-03 11:36:40.173
4441649e-382e-4cf3-84d9-d984ffea62e6	c1000000-0002-4000-8000-000000000002	SEEDED	Demo extinguisher registered via database seed	\N	ExpiringSoon	\N	b1000000-0001-4000-8000-000000000001	2026-06-03 11:36:40.177
ce9c4974-c7a3-4a49-a1c3-8fd335c03855	c1000000-0003-4000-8000-000000000003	SEEDED	Demo extinguisher registered via database seed	\N	Expired	\N	b1000000-0001-4000-8000-000000000001	2026-06-03 11:36:40.18
51c233ef-bd1f-4c65-b7c1-a38dac0dbe0f	c1000000-0004-4000-8000-000000000004	SEEDED	Demo extinguisher registered via database seed	\N	Active	\N	b1000000-0001-4000-8000-000000000001	2026-06-03 11:36:40.183
ef8d1187-ee77-46d9-952d-f47fafa8219a	c1000000-0004-4000-8000-000000000004	ASSIGNED	Extinguisher assigned to 1 user(s)	\N	\N	{"assignedUserIds": ["2e1cafaa-d817-44b2-805e-2fa54640e4ee"]}	d1cae370-f0a9-40ea-b662-73b459d4af56	2026-06-03 11:54:13.766
3050d0db-e234-44b6-8d59-0729ce3bf21f	c1000000-0003-4000-8000-000000000003	ASSIGNED	Extinguisher assigned to 2 user(s)	\N	\N	{"assignedUserIds": ["2e1cafaa-d817-44b2-805e-2fa54640e4ee", "b1000000-0003-4000-8000-000000000003"]}	d1cae370-f0a9-40ea-b662-73b459d4af56	2026-06-03 11:54:19.58
\.


--
-- Data for Name: asset_service_records; Type: TABLE DATA; Schema: asset; Owner: postgres
--

COPY asset.asset_service_records (id, "assetId", "serviceType", "actionTaken", "issuesIdentified", recommendations, "serviceDate", "technicianId", "technicianName", notes, "nextServiceDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asset_user_assignments; Type: TABLE DATA; Schema: asset; Owner: postgres
--

COPY asset.asset_user_assignments (id, asset_id, user_id, assigned_at) FROM stdin;
46fe854b-f25a-46d1-b50f-55ca1904643d	c1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	2026-06-03 11:36:40.172
eb51fe51-2406-4f38-97a1-641cd89963c0	c1000000-0002-4000-8000-000000000002	b1000000-0003-4000-8000-000000000003	2026-06-03 11:36:40.176
6a19e55d-d95b-48b0-8b9f-acfbed8eeaa5	c1000000-0004-4000-8000-000000000004	2e1cafaa-d817-44b2-805e-2fa54640e4ee	2026-06-03 11:54:13.759
e2f303d4-44e9-443b-b270-7e008c13e0f0	c1000000-0003-4000-8000-000000000003	2e1cafaa-d817-44b2-805e-2fa54640e4ee	2026-06-03 11:54:19.576
e64fd478-ce40-47c6-b7e4-96635b2302e2	c1000000-0003-4000-8000-000000000003	b1000000-0003-4000-8000-000000000003	2026-06-03 11:54:19.576
\.


--
-- Data for Name: fire_extinguisher_assets; Type: TABLE DATA; Schema: asset; Owner: postgres
--

COPY asset.fire_extinguisher_assets (id, "assetCode", "customerId", "productId", "productName", "orderId", "invoiceId", "serialNumber", location, "extinguisherType", size, "installationDate", "purchaseDate", "installationLocation", "serviceDate", "nextServiceDate", "expirationDate", "refillBookedAt", status, notes, "createdAt", "updatedAt") FROM stdin;
c1000000-0004-4000-8000-000000000004	TZW-FE-004	665891f8-710a-4092-9d88-998b9ab6a95b	manual	Fire extinguisher	\N	\N	SN-DEMO-004	Annex building — kitchen	Water	lb1_5	2026-06-03 12:00:00	2026-06-03 11:36:40.181	Annex building — kitchen	\N	\N	2027-03-10 12:00:00	\N	Active	Demo seed asset for TZW LTD FEMS.	2026-06-03 11:36:40.181	2026-06-03 11:54:13.713
c1000000-0003-4000-8000-000000000003	TZW-FE-003	a1000000-0001-4000-8000-000000000001	manual	Fire extinguisher	\N	\N	SN-DEMO-003	Warehouse bay 4	Foam	lb12	2026-06-03 12:00:00	2026-06-03 11:36:40.178	Warehouse bay 4	\N	\N	2026-04-19 12:00:00	\N	Expired	Demo seed asset for TZW LTD FEMS.	2026-06-03 11:36:40.178	2026-06-03 11:54:19.532
c1000000-0001-4000-8000-000000000001	TZW-FE-001	a1000000-0001-4000-8000-000000000001	manual	Fire extinguisher	\N	\N	SN-DEMO-001	Ground floor — reception	CO2	lb5	2026-06-03 11:36:40.17	2026-06-03 11:36:40.17	Ground floor — reception	\N	\N	2027-07-08 11:36:40.059	\N	Active	Demo seed asset for TZW LTD FEMS.	2026-06-03 11:36:40.17	2026-06-03 11:36:40.17
c1000000-0002-4000-8000-000000000002	TZW-FE-002	a1000000-0001-4000-8000-000000000001	manual	Fire extinguisher	\N	\N	SN-DEMO-002	Level 2 — server room	DryChemical	lb9	2026-06-03 11:36:40.175	2026-06-03 11:36:40.175	Level 2 — server room	\N	\N	2026-06-21 11:36:40.06	\N	ExpiringSoon	Demo seed asset for TZW LTD FEMS.	2026-06-03 11:36:40.175	2026-06-03 11:36:40.175
\.


--
-- Data for Name: maintenance_tasks; Type: TABLE DATA; Schema: asset; Owner: postgres
--

COPY asset.maintenance_tasks (id, task_number, asset_id, source_inspection_id, issue_identified, action_required, recommendation, assigned_to_id, assigned_to_name, status, maintenance_date, completed_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auth_audit_logs; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.auth_audit_logs (id, user_id, action, ip_address, user_agent, metadata, created_at) FROM stdin;
a2c8b191-f9e5-4721-8405-571d3cca5c59	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:15:26.063
8a92352c-46f0-4cf1-855e-c62a1b97f424	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:23:18.085
d8de7c7c-6fdc-49fa-8c88-6bd6a6d82eed	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:30:03.147
4a520bf4-c4d8-409e-9be6-437bba02f147	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:30:19.931
74d757b0-a1e0-421e-b82a-df0cd21851d2	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:44:40.226
ee0a6ea0-9f4e-4a3e-bb0a-5d04ae6dd596	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:48:02.949
ae633e87-e664-4064-8b27-462796e7f891	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"fields": ["firstName", "lastName"]}	2026-06-03 08:48:52.961
a4f959c8-328a-425d-b09c-2d31baf5dcbd	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"fields": ["firstName", "lastName"]}	2026-06-03 08:48:57.502
d50a5e56-0a67-4440-ada8-157ac2f67f63	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:49:13.544
af378a8a-702e-452e-9470-5039a1f65383	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:49:52.748
3050659b-b168-4297-94e6-9678cfbf712d	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 08:55:16.265
45a389b5-d99a-4091-a416-ae5570c3a9b2	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 08:55:22.018
a971e350-671d-4cf5-a452-331b01a39599	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 08:55:30.965
515c8d21-8b8c-4d67-a245-85def7ebee10	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:58:05.45
2e8bbacb-051e-481a-b825-33cd87db4a89	\N	OTP_SENT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"purpose": "signup"}	2026-06-03 08:22:16.58
300ad8cb-5c27-4e58-addc-df703c9df43c	\N	SIGNUP	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"role": "User", "email": "bettyndinabo@gmail.com"}	2026-06-03 08:22:16.588
a06c7e23-1041-4425-8842-7573ef10aecf	\N	OTP_VERIFIED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"purpose": "signup"}	2026-06-03 08:22:38.599
89568afb-dc2c-43d8-8609-ac3bb66260af	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:22:44.294
dfd957d8-4e3f-42a5-9d9d-01ddf6abf067	\N	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:23:12.072
ae4a9d93-f482-4e31-a903-92004281f832	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:30:05.862
15d2c574-53b4-4921-b2fb-3ec193fb442c	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:30:23.511
044c9a62-1358-489d-94f9-d3484dc72aad	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:30:38.955
1ce9260b-8857-4ad4-ba7b-2f9f0ec3debd	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:42:30.52
accc3f3f-dba5-4c6b-be7e-0677a28d121c	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:47:10.479
31ecafe8-133d-4b57-8b57-375745292487	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:52:57.014
a5cdfd83-9840-4942-ada7-b9ba18d0f1b6	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 10:06:49.235
6e377735-3c46-4076-ab68-f04b1294552c	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 10:12:53.247
9a4cbf54-2bdf-4c71-90df-014aff4c51da	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 10:22:46.727
531baa51-f2f1-4dd3-be45-3de951719ed6	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 10:55:22.183
5bc9d549-b762-403d-9db2-580c94650800	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 10:55:28.895
0104ee63-aeeb-4c4a-bcb5-8b43f76b1205	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:05:12.263
665af9b9-8ec2-44f2-92bd-9fac3426e89f	\N	USER_INVITED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"email": "princechristianmulindwa@gmail.com"}	2026-06-03 08:57:12.255
01b661ba-67c2-4ed2-adff-e1bedf5a63f6	\N	PASSWORD_CHANGED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:58:30.908
59eda66b-a42c-47fb-9f2a-d501b53fd604	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 08:58:59.189
83e9012b-09da-42b9-9c9f-27b532083c8b	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:02:53.706
a7e48217-353f-488c-a9ee-c5554baf7084	\N	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:03:14.037
a8bc46ba-ad77-48ae-a3a6-70a87a9de269	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:28:01.746
fd131a95-7292-4529-8eda-4106b34e6ce7	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	{"admin": true, "email": "princechristianmulindwa@gmail.com", "permanent": true}	2026-06-03 11:05:12.407
9810abc4-060b-4874-8b60-a92fd20b81cf	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:05:18.628
30b7552c-2e8f-4740-883f-15ef5f7654d1	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true}	2026-06-03 10:55:46.003
24e0961d-d88e-4591-a39b-259398489ebc	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "fields": ["role"]}	2026-06-03 11:02:05.719
cf37c332-7ea7-4f08-b3a6-f094619b8e1a	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "email": "user@fems.local", "permanent": true}	2026-06-03 11:05:54.203
559a4678-0a7e-430c-93a0-fbef935fdb44	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "email": "inspector@fems.local", "permanent": true}	2026-06-03 11:06:07.844
1e5cb605-f548-4c9e-8ba6-61d528a54a73	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:44:45.758
80a8cc22-3c67-4084-96a1-717971103bb5	\N	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:46:07.313
223652a7-562f-425e-8749-63f02d48b43a	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:49:16.858
0efbd629-b4f4-470f-a659-7aa5381c948c	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:11:19.099
4b5e42b4-7198-47bf-b815-152fd58073fc	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:12:49.062
784982fb-0620-4f50-ade5-c934fce753c6	\N	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 08:49:50.366
6f1d422f-fcde-40ff-b724-6762bb188c2d	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 09:00:07.52
299443c7-7acb-4a1d-9a68-8df0699d5067	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 09:00:37.264
7a6971f1-cf46-42ed-8191-5ba475da2885	\N	PASSWORD_RESET_REQUESTED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:01:04.014
ee28158d-3d50-43c7-9b77-0732d2c1ebb7	\N	PASSWORD_RESET_COMPLETED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:01:49.191
2117ba04-7b75-4ba5-8258-bae9c0d0cf08	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 09:01:54.431
9e8cff08-2bd1-4d87-8a3b-9ae60dc8fd73	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:18:27.528
f5af5d75-05dc-491e-82a6-aa52448e9a87	\N	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 09:29:18.165
0c2ffbcf-ec0e-4a95-9002-5750702512c5	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:04:34.744
1207236f-7bf0-4d46-8eaa-806cb7a819c4	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "email": "bettyndinabo@gmail.com", "permanent": true}	2026-06-03 11:06:12.54
4cb39803-c04f-469d-90e2-a58cf6eb0c2a	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:06:30.03
f253add8-1dba-4a06-ba80-7821fb2fbaa9	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"email": "bettyndinabo@gmail.com", "reason": "user_not_found"}	2026-06-03 11:06:37.256
57cefed9-ac3a-4d3a-855a-b417589ee6c7	2e1cafaa-d817-44b2-805e-2fa54640e4ee	SIGNUP	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"role": "User", "email": "bettyndinabo@gmail.com", "provider": "google"}	2026-06-03 11:06:53.173
c9850fa7-24d0-460b-8802-d1dc75fd437b	2e1cafaa-d817-44b2-805e-2fa54640e4ee	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:06:53.185
1fd39264-84c5-48ca-b67f-413051a7fc4f	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:07:48.251
eb64ff83-7ad5-4498-ba90-11882812f21e	\N	OTP_SENT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"purpose": "signup"}	2026-06-03 11:07:21.653
cda2fcb5-5a31-4ff9-8b27-8894c25eb5c2	\N	SIGNUP	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"role": "User", "email": "princechristianmulindwa@gmail.com"}	2026-06-03 11:07:21.657
a01522c2-e56d-4919-bd0d-86fec7a42f3b	\N	OTP_VERIFIED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"purpose": "signup"}	2026-06-03 11:07:35.957
c4eb087c-2d7d-4f88-ba96-3881bd22f32b	\N	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:07:39.901
177858b7-5d30-4ab8-a484-809476520abe	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "email": "princechristianmulindwa@gmail.com", "permanent": true}	2026-06-03 11:07:58.031
46da51cf-7e01-40d6-9c7a-a14166fed5ac	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"email": "princechristianmulindwa@gmail.com", "reason": "user_not_found"}	2026-06-03 11:08:04.312
ed653474-52b9-45c0-b3af-9cddd469adc6	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	USER_INVITED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"email": "princechristianmulindwa@gmail.com"}	2026-06-03 11:08:42.492
9b7f53c2-c267-450d-a076-6a37b80eea5e	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 11:09:10.776
ddb32e22-7208-4fc6-9025-8c7ff43f9de5	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 11:09:30.099
310ec5dc-f1d4-4c7a-bfbb-89904c96d048	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:09:43.802
79da2322-9908-4b27-8e7e-87301e82e7ac	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 11:10:36.158
6b80471b-b0da-4109-abcf-f59a67409cde	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 11:10:40.202
a64e0cf0-41c1-4a6f-9b01-0851052fff59	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "invalid_password"}	2026-06-03 11:16:56.727
755e5571-0479-4601-8372-173c780f7cb4	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	PASSWORD_RESET_REQUESTED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:17:17.229
8b11ccde-81a6-409b-908a-cc0f01b83d29	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	PASSWORD_RESET_COMPLETED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:17:46.873
8bcdb353-1a1f-4d37-9373-665cd0efb808	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:17:49.606
ec63c795-e313-459d-bcb7-58de87e8940b	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	PASSWORD_CHANGED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:18:31.611
401f1879-47f9-4372-b47a-5d3545e3db6b	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 11:21:01.299
bba3fe5c-11c5-4c46-a6e5-4938ec7313e2	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:24:17.072
8d275526-911e-4aad-9734-536465c1f321	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:26:31.362
a461f492-f920-494c-b8e5-abe60a745b01	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"email": "princemulindwachristian@gmail.com", "reason": "user_not_found"}	2026-06-03 11:32:57.91
0ad965fa-a418-427e-a277-2c8d679a54d3	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:33:20.156
6d250102-052f-4a33-9bb0-ca4cb4f33b78	2e1cafaa-d817-44b2-805e-2fa54640e4ee	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"reason": "google_only_account"}	2026-06-03 11:37:56.475
07f9c524-beb6-4c8b-a22e-294d57e043be	2e1cafaa-d817-44b2-805e-2fa54640e4ee	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:38:06.914
c7c52fa2-2576-43e9-9322-fec3d81ae498	2e1cafaa-d817-44b2-805e-2fa54640e4ee	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 11:38:28.741
b01dff20-71e7-4476-bb2f-45a03ee07283	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 11:38:55.119
6f12c01a-6e95-4beb-8724-16a06a997cfb	d1cae370-f0a9-40ea-b662-73b459d4af56	PROFILE_UPDATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"avatar": true}	2026-06-03 11:39:03.92
fb55ccd6-1f02-4b44-8941-32da5d9aed3f	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGOUT	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:39:26.091
8d0dc86b-e734-483c-87e3-4b67ef0913ef	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-03 11:39:43.746
9e43c954-81e5-413d-b290-144c61f5a3bf	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:46:39.516
94932c54-8f10-4c11-a987-90d7398e5b51	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:46:49.288
a13cc970-c291-4dc1-b9f3-9e2203610312	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:47:08.949
bed6749d-fc7f-4c89-9388-e169697f4790	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:47:28.067
11a300aa-1728-492d-be83-8150fee456cd	\N	LOGIN_FAILED	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	{"email": "admin@fems.local", "reason": "user_not_found"}	2026-06-03 11:49:00.361
d6c8a1f2-8913-4c02-bfa2-952859a74161	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:49:21.329
873fc2d0-60a7-4ef4-b661-5c6a3be5bd8a	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:49:29.65
7175f38f-cbf9-44c1-b276-3d83deeab288	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:49:43.096
3b3ba095-7d02-440d-b983-e3cd75f2a16a	d1cae370-f0a9-40ea-b662-73b459d4af56	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:51:45.013
76dda3e3-c1ff-4a4d-90fe-a46bbfc06dcf	\N	LOGIN	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.21996.1	\N	2026-06-03 11:47:08.454
be046f95-7a81-4f98-b608-a14995d9d41d	\N	ACCOUNT_DEACTIVATED	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"admin": true, "email": "user@fems.local", "permanent": true}	2026-06-03 11:54:33.026
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.otps (id, user_id, destination, code_hash, purpose, expires_at, verified_at, attempts, created_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
89c397db-b891-421e-af93-86ade70477d3	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	e2fa97fde254fc78e33048ece483dafd3e5f1e6447726070e8cba98fd59ec89f	2026-06-03 12:17:12.596	2026-06-03 11:17:46.865	2026-06-03 11:17:12.599
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.roles (id, name, description, created_at, updated_at) FROM stdin;
6458569b-b08e-4de5-b088-6e37b4d37cdd	Admin	TZW LTD administrator — users, settings, reports	2026-06-03 08:10:52.15	2026-06-03 11:36:20.819
a8313af0-b2b6-4a10-ab49-14e69a43a046	Inspector	Conducts inspections and logs maintenance	2026-06-03 08:10:52.155	2026-06-03 11:36:20.823
a7db426a-324e-4a09-a596-5db7f9bc1fae	User	Views extinguishers and schedules inspections	2026-06-03 08:10:52.156	2026-06-03 11:36:20.824
c92ece93-b9a9-40ba-b0db-26d49d44ccb6	Staff	Legacy office staff (same access as Admin for management)	2026-06-03 08:10:52.156	2026-06-03 11:36:20.825
7bb81624-100f-4985-9728-05320bfae02b	Technician	Legacy field technician (maps to Inspector)	2026-06-03 08:10:52.157	2026-06-03 11:36:20.825
447185d2-6183-4e6d-b9c0-67f9d26bd180	Customer	Legacy portal user (maps to User)	2026-06-03 08:10:52.158	2026-06-03 11:36:20.826
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.user_roles (user_id, role_id, assigned_at) FROM stdin;
d1cae370-f0a9-40ea-b662-73b459d4af56	6458569b-b08e-4de5-b088-6e37b4d37cdd	2026-06-03 08:10:52.453
2e1cafaa-d817-44b2-805e-2fa54640e4ee	a7db426a-324e-4a09-a596-5db7f9bc1fae	2026-06-03 11:06:53.17
ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	a8313af0-b2b6-4a10-ab49-14e69a43a046	2026-06-03 11:08:42.449
b1000000-0002-4000-8000-000000000002	a8313af0-b2b6-4a10-ab49-14e69a43a046	2026-06-03 11:36:21.419
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (id, email, google_id, password_hash, first_name, last_name, full_name, phone_number, is_email_verified, is_active, customer_id, last_login_at, created_at, updated_at, must_change_password, profile_image_url) FROM stdin;
ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	princechristianmulindwa@gmail.com	\N	$2a$12$iwpwCwCj6fvDdGeTvNE1/uALr0diSSRyqRF2Vv8X3Nyai4AK3iUBK	Prince	Christian	Prince Christian	\N	t	t	\N	2026-06-03 11:33:20.111	2026-06-03 11:08:42.449	2026-06-03 11:33:20.112	f	/uploads/profiles/ba5e4579-90b5-4fd9-a440-81c31cb7c8c9.jpg
b1000000-0002-4000-8000-000000000002	inspector@fems.local	\N	$2a$12$10uhfNS6MzQIkvd.hJlLye/BFThVH0M6QhAR0wlSEyt1ICbl7d1We	Field	Inspector	Field Inspector	\N	t	t	\N	\N	2026-06-03 11:36:21.35	2026-06-03 11:36:21.35	f	\N
2e1cafaa-d817-44b2-805e-2fa54640e4ee	bettyndinabo@gmail.com	108867024632524191583	\N	Betty	Ndinabo	Betty Ndinabo	\N	t	t	665891f8-710a-4092-9d88-998b9ab6a95b	2026-06-03 11:38:06.87	2026-06-03 11:06:53.17	2026-06-03 11:38:28.731	f	/uploads/profiles/2e1cafaa-d817-44b2-805e-2fa54640e4ee.jpg
d1cae370-f0a9-40ea-b662-73b459d4af56	kamahorolinda@gmail.com	\N	$2a$12$0A9oMSSABksIUKgKFNC9NeaM0RC4DzDiptByInETHlBbqLICr.7jW	Linda	Kamahoro	Linda Kamahoro	\N	t	t	\N	2026-06-03 11:51:44.968	2026-06-03 08:10:52.37	2026-06-03 11:51:44.969	f	/uploads/profiles/d1cae370-f0a9-40ea-b662-73b459d4af56.jpg
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: customer; Owner: postgres
--

COPY customer.customer_addresses (id, "customerId", label, street, city, state, "postalCode", country, "isPrimary", "createdAt", "updatedAt") FROM stdin;
f1000000-0001-4000-8000-000000000001	a1000000-0001-4000-8000-000000000001	Main site	14 Kenyatta Avenue	Nairobi	\N	\N	Kenya	t	2026-06-03 11:36:22.783	2026-06-03 11:36:38.386
\.


--
-- Data for Name: customer_notes; Type: TABLE DATA; Schema: customer; Owner: postgres
--

COPY customer.customer_notes (id, "customerId", content, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: customer; Owner: postgres
--

COPY customer.customers (id, "fullName", "nationalIdOrPassport", "phoneNumber", email, "physicalAddress", "customerType", "userId", notes, "deletedAt", "createdAt", "updatedAt") FROM stdin;
665891f8-710a-4092-9d88-998b9ab6a95b	Nyirandinabo Beatrice	\N	N/A	bettyndinabo@gmail.com	\N	individual	2e1cafaa-d817-44b2-805e-2fa54640e4ee	\N	\N	2026-06-03 09:38:59.303	2026-06-03 11:06:53.18
ad37a17b-fbbd-40e4-8281-8b1127c895a6	Prince Murindwa	\N	N/A	princechristianmulindwa@gmail.com	\N	individual	\N	\N	\N	2026-06-03 11:07:35.962	2026-06-03 11:07:58.035
a1000000-0001-4000-8000-000000000001	Demo User	\N	+254712345678	user@fems.local	14 Kenyatta Avenue, Nairobi	individual	\N	Demo portal customer for FEMS dashboards and inspections.	\N	2026-06-03 11:36:22.766	2026-06-03 11:54:33.09
\.


--
-- Data for Name: expiry_alert_trackers; Type: TABLE DATA; Schema: notification; Owner: postgres
--

COPY notification.expiry_alert_trackers (id, "assetId", "assetCode", "customerId", "userId", "expirationDate", "customerSeenAt", "refillBookedAt", "alertsResolvedAt", "lastReminderSentAt", "policeReportSent", "alert30Sent", "alert7Sent", "alertOnExpirySent", "alertOverdueSent", "createdAt", "updatedAt") FROM stdin;
f2e68088-6668-447a-8348-1022e16cecae	c1000000-0004-4000-8000-000000000004	TZW-FE-004	a1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	2027-03-10 11:36:40.06	\N	\N	\N	\N	f	f	f	f	f	2026-06-03 11:44:29.732	2026-06-03 11:52:29.302
b287b695-29bc-458f-a859-39423efd890f	c1000000-0001-4000-8000-000000000001	TZW-FE-001	a1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	2027-07-08 11:36:40.059	\N	\N	\N	\N	f	f	f	f	f	2026-06-03 11:44:29.739	2026-06-03 11:52:29.306
9b0e16b0-ea2e-4dfa-ba71-20a01569416d	caab1f54-8624-464a-aae9-afaa6209b762	FE-29809	00000000-0000-4000-8000-000000000000	\N	2026-06-02 12:00:00	\N	\N	\N	2026-06-03 09:24:46.957	f	f	f	f	f	2026-06-03 08:26:26.612	2026-06-03 09:24:46.995
04829851-d5cc-4789-8f44-6e80043017a1	76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b	FE-57566	00000000-0000-4000-8000-000000000000	\N	2026-06-03 12:00:00	2026-06-03 08:56:12.569	\N	\N	2026-06-03 09:24:46.957	f	f	f	f	f	2026-06-03 08:27:22.509	2026-06-03 09:24:47.016
9a1570a6-92b6-44d3-9a72-15a63d6d4a2a	c1000000-0003-4000-8000-000000000003	TZW-FE-003	a1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	2026-04-19 11:36:40.06	\N	\N	\N	2026-06-03 11:44:29.802	f	f	f	f	f	2026-06-03 11:44:29.697	2026-06-03 11:52:29.285
e788c39e-531f-415e-bdd7-47ee6ad3af2e	cc60f726-359f-4e00-9143-cbcc0eb87266	FE-51456	00000000-0000-4000-8000-000000000000	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	2026-06-04 12:00:00	\N	\N	\N	2026-06-03 09:24:46.957	f	f	f	f	f	2026-06-03 09:05:10.046	2026-06-03 11:52:29.286
6ed81b57-a661-4cfa-b3a5-1fd1a92393c3	803c4c2c-46c2-417e-ace6-5b0e15fff962	FE-95298	665891f8-710a-4092-9d88-998b9ab6a95b	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	2026-06-10 12:00:00	2026-06-03 11:05:03.844	2026-06-03 11:04:47.122	2026-06-03 11:05:06.373	2026-06-03 11:03:59.485	f	f	f	f	f	2026-06-03 11:03:57.901	2026-06-03 11:52:29.29
d4422372-c5a9-4a62-82a2-56e701dc034a	04ca9126-5bd6-4f39-9258-b8ab31252168	FE-67587	665891f8-710a-4092-9d88-998b9ab6a95b	2e1cafaa-d817-44b2-805e-2fa54640e4ee	2026-06-19 12:00:00	\N	\N	\N	2026-06-03 11:19:13.85	f	f	f	f	f	2026-06-03 11:19:12.133	2026-06-03 11:52:29.294
2fe70e28-5c6d-4d9f-9763-8d6f3e0a5501	c1000000-0002-4000-8000-000000000002	TZW-FE-002	a1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	2026-06-21 11:36:40.06	\N	\N	\N	2026-06-03 11:44:29.802	f	f	f	f	f	2026-06-03 11:44:29.724	2026-06-03 11:52:29.298
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: notification; Owner: postgres
--

COPY notification.notification_logs (id, "notificationId", action, channel, detail, metadata, "createdAt") FROM stdin;
d4eb23d7-be0f-4df7-ab3e-ece3126699d4	a4c49475-f57c-46dd-8c23-3a409538f2db	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 08:26:26.661
4be21f89-fd41-416e-94a4-56432e6794e1	13a8e267-7613-447e-a8e3-30c6a778d674	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 08:27:22.521
bbe68f74-bb8f-48b5-a77c-003804038503	13a8e267-7613-447e-a8e3-30c6a778d674	SEEN	InApp	Notification marked as seen	\N	2026-06-03 08:29:28.587
1de447a6-52ac-43cd-8dc4-4ea880b8cc29	a4c49475-f57c-46dd-8c23-3a409538f2db	SEEN	InApp	Notification marked as seen	\N	2026-06-03 08:29:29.257
0e7f2b00-56f6-4b11-8468-75b25b443ea1	2881b3e1-6dba-420a-92d6-6392cb51a77e	FAILED	Email	Recipient email required	\N	2026-06-03 08:51:31.68
2e61ce70-a748-4b91-830c-4e0766b625ed	e24bc397-d4bb-40f4-bdbe-6fb4f7c3384d	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 08:51:31.689
1a172227-d762-4c6a-9861-fc4e264a5d54	2881b3e1-6dba-420a-92d6-6392cb51a77e	SEEN	Email	Notification marked as seen	\N	2026-06-03 08:56:12.561
ca3e4619-26a7-429c-9163-58910706d00f	e24bc397-d4bb-40f4-bdbe-6fb4f7c3384d	SEEN	InApp	Notification marked as seen	\N	2026-06-03 08:56:13.099
49e8f9b7-47d8-44a7-99c5-5017f054babb	0026ee2d-62d5-4e60-9dcf-b342709d71a9	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:05:10.083
71fe7840-e699-454b-803c-1c678608da36	70640ee1-f4de-4833-afb4-0537468d3e76	FAILED	Email	Recipient email required	\N	2026-06-03 09:08:16.604
9f4df960-bb8e-4b46-a5c0-38a6ef2c0f74	31f95a51-72e1-4da3-8ecb-21c0839473bc	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:08:16.614
dda87c4f-6611-4a19-acb7-0ceec8eae297	ed4d7555-41ff-4f73-9320-7c466a03915e	FAILED	Email	Recipient email required	\N	2026-06-03 09:24:46.987
8d44b939-08f0-43f0-a9cf-285adf764d8f	45685cab-45d9-4a25-b133-e1186c10d851	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:24:46.994
56eaf08d-9572-4311-b79f-8d3215e00add	4c2a563f-34f3-4c85-a11c-ecbeb1b043b1	FAILED	Email	Recipient email required	\N	2026-06-03 09:24:47.008
543d29f6-7963-4029-bc6c-fc8c25b83436	381f4e52-9f68-476e-91f8-309e2c53445b	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:24:47.015
c6611489-d1ad-4975-a39f-1f11c239a1bf	4c256a31-2382-4504-9603-7574acb0c5f3	FAILED	Email	Recipient email required	\N	2026-06-03 09:24:47.024
77e79dbe-c8e9-44ee-9eed-7f8776b0ff6c	262382d6-8606-4816-b8ea-c9374a2f4b2b	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:24:47.031
e9ea4c8b-8b11-4c8d-ab98-35b222f567f3	f283523b-fe24-416c-900b-06cd2c80c4d7	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b0e76feasm126899545e9.9 - gsmtp	\N	2026-06-03 09:39:07.208
778549ae-88ee-4e94-9b10-43fda3847bec	c6dcfc6f-8d87-4078-b8a4-2776d8429954	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:39:07.22
8971f5b6-7603-4643-96ff-5db951d63251	255c0884-d06b-4bdb-8b2a-33030332f327	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2dc412sm6599917f8f.4 - gsmtp	\N	2026-06-03 09:39:08.914
9f3a1378-ab12-47a2-8068-a9a09fcde9f8	e0e41423-36b4-4283-b58e-1cf2d1d69e8c	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:39:08.923
51064fd4-45e8-446f-9346-2d53ba7e413e	87ca0fec-a75b-43cb-95b6-9f9c23289e56	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2ec711sm5913683f8f.12 - gsmtp	\N	2026-06-03 09:39:10.97
d5459a7f-a819-4711-9db2-6ce639f2efc9	c469ea02-af61-4f99-9dcd-887646306089	FAILED	Email	Recipient email required	\N	2026-06-03 09:56:08.8
2668ebb4-afc7-4fd3-9524-1eabeeaa614d	82cfacb5-db2c-47a2-9f6d-b51f18312617	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 09:56:08.811
8011aa01-47fc-4a33-8d78-25f72f46ca2e	efe44528-5d90-48a2-9cce-1872beeec147	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 10:30:32.517
00702d18-4184-4fe5-b34a-6b86dc088605	a3ef4a3a-5403-49ca-aedc-f86d91087355	FAILED	Email	Recipient email required	\N	2026-06-03 10:30:32.523
5ecd40d8-e793-4db8-8c3b-240689ceffca	d3bc6bdf-69ce-4fa7-80d5-148fdc7fa6b9	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b63fbcb7sm45815655e9.15 - gsmtp	\N	2026-06-03 11:03:59.436
1580e459-3a47-4c7c-97bd-ad607e4502b0	10e4e99e-c9e6-4b2e-85eb-ef0dddaea6e3	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f344558sm6910254f8f.18 - gsmtp	\N	2026-06-03 11:04:00.9
cbe20751-e91c-4976-9782-4058e086dfeb	82430e04-b3c5-4b50-bf22-e08898de2d67	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b616d6a9sm52390705e9.7 - gsmtp	\N	2026-06-03 11:16:33.184
04e70b96-3995-4f4e-8062-4e806afd7d6d	613d3ee5-3cc6-48cc-a00e-60b2a7ecad7b	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:16:33.208
d172740b-062d-4b6b-91b3-f9ad1516e256	78dc157b-8498-40c8-9e87-0f00e2ce0700	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:19:12.172
beca0d34-68e6-4007-bc55-66e45b49c91d	c3e1e9c2-217c-4689-9161-2501222b63fd	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2dcbe3sm6606343f8f.8 - gsmtp	\N	2026-06-03 11:19:13.794
70f1848d-d67f-4b6a-8494-f1400dc6cb48	8591ad34-5fb5-492c-90e8-12264f97e592	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f345209sm6608792f8f.17 - gsmtp	\N	2026-06-03 11:19:15.429
73d0c38f-01ab-476e-a58a-ecaa268fb72a	19162b93-d949-4497-8901-002bb374df2c	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:19:35.521
0f5ec99f-e64c-43f4-8b31-9d1cd6623976	d0cdd3e9-95b1-48cc-9a0e-5a4796a5d154	FAILED	Email	Recipient email required	\N	2026-06-03 11:19:35.53
71ddc486-8e26-4cce-ba53-089102544e60	0b4b442b-4be8-4fff-9824-b5edc5f31029	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:21:19.313
94be62af-1d67-4dd4-8ec2-9bbbb6a10f86	19162b93-d949-4497-8901-002bb374df2c	SEEN	InApp	Notification marked as seen	\N	2026-06-03 11:42:11.327
a70a9976-8412-4e84-a80d-dc23cd052426	3658629d-8cca-402b-85b3-f68853763b64	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3529e0sm7133336f8f.28 - gsmtp	\N	2026-06-03 11:43:01.113
f1d30930-950a-42e5-afa9-2ac170ab1250	ec6305f0-aec4-44ba-8cad-0eb2b65c12b8	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:43:01.125
d37f94e0-dcb7-4577-89cd-f7d32417dafa	07356a0e-cc03-43a3-9f0b-04733af7795b	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b615fac0sm48747755e9.4 - gsmtp	\N	2026-06-03 11:43:31.508
9671a66b-8439-4568-997c-cc139fce1eb6	ece6ca44-45c8-4969-a770-e1a2ed1e0581	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:43:31.532
66256742-3af3-4add-9628-6768729615f6	00001199-1ee8-473a-9d4d-66f31dfcf961	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2ed944sm7237515f8f.13 - gsmtp	\N	2026-06-03 11:44:38.366
6b2eb448-8bc9-4e64-838d-9aeb73d1ae49	7dd4fb16-1e7d-41f1-aaa9-bce61849f21f	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:44:38.401
d71a036c-204c-4083-b013-1fa09cbface6	dcf8a745-e660-4da8-a0ce-9e0a0b7cd1b8	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f351d69sm11223441f8f.29 - gsmtp	\N	2026-06-03 11:44:39.87
68e72432-3763-47dd-b1a5-bd25ca3e634b	6ae1fce4-91d7-493a-a0b2-f4cecbee24af	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:44:39.902
14a64849-37dc-4952-935f-a03fc2964cde	b273e677-b277-403d-87b5-a442cf5563d0	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:47:41.441
b74d19a3-52ca-4086-a308-945988c253f4	98661335-3a4c-4449-b5fc-1dcd5e5ab709	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3446aesm8169793f8f.24 - gsmtp	\N	2026-06-03 11:47:44.182
ba69c3f8-d54a-4a26-bee9-8066c95fef0c	21b2c103-c681-4865-946e-f55ad8f59af4	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:47:44.193
12201704-afae-41d3-a261-be77b6bf716b	d338d14d-7b1b-419c-b5e2-b74e97e8c04e	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:49:18.481
832eb085-7c24-4eb2-90f6-101d3d1cb52d	e766c154-6b7f-4ef5-82ec-851c2d722a2e	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3444fesm7794064f8f.20 - gsmtp	\N	2026-06-03 11:49:20.53
bb9bf18f-3f48-4762-af49-7f26853a40b8	0bbdced2-b4c3-4a03-aea3-916da6bc8f41	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:50:57.762
683aaaff-0224-4089-b661-47aafa098766	719f5839-a925-4f49-900c-49183729e5aa	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:50:57.793
ff95b233-8e15-4b98-8b3f-cadcc97ae47b	57788cf2-1030-4736-b0b7-e99c17f6070c	SENT	InApp	Notification dispatched successfully	{"detail": "In-app notification created"}	2026-06-03 11:51:45.077
97ac5ea4-0ce2-4fe9-9c7c-2a53510d4ea2	91844efe-c572-4ee0-8b34-0570cafa2ddb	FAILED	Email	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b0e88fdesm144673315e9.14 - gsmtp	\N	2026-06-03 11:51:47.694
faa173e8-3294-4f6a-ba6f-89fb9fb4eb33	b273e677-b277-403d-87b5-a442cf5563d0	SEEN	InApp	Notification marked as seen	\N	2026-06-03 11:53:42.538
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: notification; Owner: postgres
--

COPY notification.notification_templates (id, code, name, channel, subject, body, "htmlBody", "eventType", "isActive", "createdAt", "updatedAt") FROM stdin;
448d40a1-6b89-42b1-8be6-83ae671f4066	expiry-7-days-inapp	Expiry 7-Day In-App	InApp	7-day expiry reminder	Extinguisher {{assetCode}} expires in 7 days ({{expirationDate}}).	\N	ExpiryAlert7	t	2026-06-03 08:11:03.865	2026-06-03 11:52:29.108
729c370b-4f36-4f9e-b6f5-de85016cf528	inspection-scheduled-inspector-inapp	Inspection Scheduled — Inspector In-App	InApp	New inspection scheduled	{{requestNumber}}: {{assetSerialNumber}} at {{assetLocation}} on {{scheduledDateLabel}} at {{scheduledTime}}.	\N	ServiceRequested	t	2026-06-03 09:24:46.86	2026-06-03 10:29:51.999
00ad8a29-f10c-4ef1-bd74-68acd0df75da	expiry-on-date	Expiry On Date Email	Email	Extinguisher {{assetCode}} expires today	Your fire extinguisher {{assetCode}} expires today ({{expirationDate}}). Arrange replacement or service immediately.	\N	ExpiryAlertOnDate	t	2026-06-03 08:11:03.867	2026-06-03 11:52:29.113
6d2b2139-7136-4601-91bd-7510c1ba7edf	order-completed-email	Order Completed Email	Email	Order {{orderNumber}} completed	Your order {{orderNumber}} has been completed. Total: RWF {{totalAmount}}.	<p>Your order <strong>{{orderNumber}}</strong> has been completed.</p><p>Total: RWF {{totalAmount}}</p>	OrderCompleted	t	2026-06-03 08:11:03.816	2026-06-03 11:52:29.051
bf30986b-1a66-4810-aa47-a7cd74459703	invoice-generated-email	Invoice Generated Email	Email	Invoice {{invoiceNumber}} ready	Invoice {{invoiceNumber}} for order {{orderNumber}} is ready. Amount: RWF {{totalAmount}}.	\N	InvoiceGenerated	t	2026-06-03 08:11:03.826	2026-06-03 11:52:29.059
78aaff98-24cf-4f07-850f-47bfba380955	asset-created-inapp	Asset Created In-App	InApp	New extinguisher registered	Fire extinguisher {{assetCode}} has been registered. Expires on {{expirationDate}}.	\N	AssetCreated	t	2026-06-03 08:11:03.829	2026-06-03 11:52:29.063
76396833-4d09-4a98-b392-c56b68bdcf0b	expiry-on-date-inapp	Expiry On Date In-App	InApp	Extinguisher expires today	Extinguisher {{assetCode}} expires today. Please arrange replacement or service.	\N	ExpiryAlertOnDate	t	2026-06-03 08:11:03.869	2026-06-03 11:52:29.115
c977012f-a665-4de1-bcfa-748b5261e32b	expiry-overdue	Expiry Overdue Email	Email	OVERDUE: Extinguisher {{assetCode}}	Your fire extinguisher {{assetCode}} expired on {{expirationDate}} and is now overdue. Compliance action is required.	\N	ExpiryAlertOverdue	t	2026-06-03 08:11:03.871	2026-06-03 11:52:29.117
f26248eb-57f1-4ac7-bae0-52f460dc187c	expiry-overdue-inapp	Expiry Overdue In-App	InApp	Extinguisher overdue	Extinguisher {{assetCode}} is overdue since {{expirationDate}}.	\N	ExpiryAlertOverdue	t	2026-06-03 08:11:03.873	2026-06-03 11:52:29.119
93a82217-a295-4c80-92d0-4cc865b95ffb	asset-expiring-email	Asset Expiring Soon Email	Email	Extinguisher {{assetCode}} expiring soon	Your fire extinguisher {{assetCode}} expires on {{expirationDate}}. Please schedule inspection or replacement.	\N	AssetExpiringSoon	t	2026-06-03 08:11:03.831	2026-06-03 11:52:29.066
2b95e32b-f992-4f42-8af1-d420f42d5a1a	inspection-scheduled-inspector-email	Inspection Scheduled — Inspector Email	Email	New inspection scheduled — {{requestNumber}}	A customer scheduled a fire extinguisher inspection.\n\nRequest: {{requestNumber}}\nExtinguisher: {{assetSerialNumber}} at {{assetLocation}}\nDate: {{scheduledDateLabel}}\nTime: {{scheduledTime}}\n\nSign in to the FEMS inspector portal to view assigned work.	<p>A customer scheduled a fire extinguisher inspection.</p><ul><li><strong>Request:</strong> {{requestNumber}}</li><li><strong>Extinguisher:</strong> {{assetSerialNumber}} — {{assetLocation}}</li><li><strong>Date:</strong> {{scheduledDateLabel}}</li><li><strong>Time:</strong> {{scheduledTime}}</li></ul><p>Sign in to the FEMS inspector portal to review pending inspections.</p>	ServiceRequested	t	2026-06-03 09:24:46.859	2026-06-03 10:29:51.997
ee30548f-9eba-4b0e-b972-caaddf4a9056	escalation-created-inapp	Escalation Created In-App	InApp	Compliance escalation opened	Escalation {{escalationId}} opened: {{reason}}	\N	EscalationCreated	t	2026-06-03 08:11:03.875	2026-06-03 11:52:29.121
47e75c71-8565-401f-8522-e74be3433b66	service-completed-email	Service Completed Email	Email	Service completed for {{assetCode}}	Service ({{serviceType}}) completed for asset {{assetCode}}.	\N	ServiceCompleted	t	2026-06-03 08:11:03.877	2026-06-03 11:52:29.123
7cd2b35d-1013-458d-8002-d793ed5815aa	asset-expiring-inapp	Asset Expiring Soon In-App	InApp	Extinguisher expiring soon	Extinguisher {{assetCode}} expires on {{expirationDate}}.	\N	AssetExpiringSoon	t	2026-06-03 08:11:03.834	2026-06-03 11:52:29.082
4a558f05-09b6-43fd-9965-43bb65e79e5d	expiry-30-days-inapp	Expiry 30-Day In-App	InApp	30-day expiry reminder	Extinguisher {{assetCode}} expires on {{expirationDate}}.	\N	ExpiryAlert30	t	2026-06-03 08:11:03.86	2026-06-03 11:52:29.1
3df5713a-65ab-48b0-880d-498fd33ace22	expiry-7-days	Expiry 7-Day Reminder	Email	Extinguisher {{assetCode}} expires in 7 days	Your fire extinguisher {{assetCode}} expires on {{expirationDate}} (7 days remaining). Please act soon.	\N	ExpiryAlert7	t	2026-06-03 08:11:03.863	2026-06-03 11:52:29.102
1d874adf-bf4c-4f53-a831-cb1ef2fe8ae4	inspection-completed-admin-inapp	Inspection Completed — Admin In-App	InApp	Inspection completed	{{requestNumber}}: {{inspectionResult}}{{maintenanceNote}}.	\N	ServiceCompleted	t	2026-06-03 10:33:12.064	2026-06-03 11:52:29.132
922aafe5-5f0f-4aa1-adb4-3eaf30b7bec6	asset-expired-email	Asset Expired Email	Email	URGENT: Extinguisher {{assetCode}} has expired	Your fire extinguisher {{assetCode}} expired on {{expirationDate}}. Replace or service it immediately to stay compliant.	\N	AssetExpired	t	2026-06-03 08:11:03.836	2026-06-03 11:52:29.085
2393a7e5-e76c-4ed6-b211-6e1f0d14a488	asset-expired-inapp	Asset Expired In-App	InApp	Extinguisher expired	Extinguisher {{assetCode}} has expired. Immediate action required.	\N	AssetExpired	t	2026-06-03 08:11:03.839	2026-06-03 11:52:29.088
4e8af633-e1c9-4c60-99fc-5ceaac63c40c	inspection-completed-user-inapp	Inspection Completed — User In-App	InApp	Inspection completed	{{requestNumber}} result: {{inspectionResult}}.	\N	ServiceCompleted	t	2026-06-03 10:33:12.065	2026-06-03 11:52:29.134
36739e41-2a8e-42e7-9a3f-49197af0ff33	inspection-scheduled-user-email	Inspection Scheduled — User Email	Email	Inspection confirmed — {{requestNumber}}	Your fire extinguisher inspection is scheduled.\n\nRequest: {{requestNumber}}\nExtinguisher: {{assetSerialNumber}} at {{assetLocation}}\nDate: {{scheduledDateLabel}}\nTime: {{scheduledTime}}\n\nAn inspector will be notified. You can track status in your FEMS account.	<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> {{requestNumber}}</li><li><strong>Extinguisher:</strong> {{assetSerialNumber}} — {{assetLocation}}</li><li><strong>Date:</strong> {{scheduledDateLabel}}</li><li><strong>Time:</strong> {{scheduledTime}}</li></ul>	ServiceRequested	t	2026-06-03 09:24:46.861	2026-06-03 11:52:29.136
4c199cd8-8a72-4fe9-a923-72739e82723d	expiry-reminder-email	Expiry Reminder Email	Email	{{alertSubject}}	{{alertBody}}	<p>{{alertBody}}</p><p><strong>Extinguisher:</strong> {{assetCode}}<br/><strong>Expiry date:</strong> {{expirationDateFormatted}}</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>	ExpiryReminder	t	2026-06-03 08:11:03.846	2026-06-03 11:52:29.09
bbcb1880-9ef2-473a-b945-885cc427faad	expiry-reminder-inapp	Expiry Reminder In-App	InApp	{{alertSubject}}	{{alertBody}}	\N	ExpiryReminder	t	2026-06-03 08:11:03.854	2026-06-03 11:52:29.094
c49a56f2-6435-42f9-b1bd-4938b2dbe51e	expiry-30-days	Expiry 30-Day Reminder	Email	Extinguisher {{assetCode}} expires in 30 days	Reminder: Your fire extinguisher {{assetCode}} will expire on {{expirationDate}} (about 30 days remaining).	\N	ExpiryAlert30	t	2026-06-03 08:11:03.858	2026-06-03 11:52:29.097
59d90c52-dc9e-4cdb-bdfb-7cb456f34507	inspection-requested-admin-inapp	Inspection Requested — Admin In-App	InApp	New inspection request	{{requestNumber}}: {{assetSerialNumber}} at {{assetLocation}} on {{scheduledDateLabel}} at {{scheduledTime}}. Assign an inspector.	\N	ServiceRequested	t	2026-06-03 10:33:12.055	2026-06-03 11:52:29.125
e39e2586-6b4a-47aa-b882-51080255c078	inspection-assigned-inspector-inapp	Inspection Assigned — Inspector In-App	InApp	Inspection assigned to you	{{requestNumber}}: {{assetSerialNumber}} at {{assetLocation}} on {{scheduledDateLabel}} at {{scheduledTime}}. Open Inspections to start.	\N	TechnicianAssigned	t	2026-06-03 10:33:12.062	2026-06-03 11:52:29.127
8646c184-ab03-4201-85b6-fce81e95c987	inspection-assigned-inspector-email	Inspection Assigned — Inspector Email	Email	Inspection assigned — {{requestNumber}}	An administrator assigned you inspection {{requestNumber}}.\n\nExtinguisher: {{assetSerialNumber}} at {{assetLocation}}\nDate: {{scheduledDateLabel}}\nTime: {{scheduledTime}}\n\nSign in to FEMS to start the visit.	<p>You have been assigned inspection <strong>{{requestNumber}}</strong>.</p><ul><li><strong>Extinguisher:</strong> {{assetSerialNumber}} — {{assetLocation}}</li><li><strong>Date:</strong> {{scheduledDateLabel}}</li><li><strong>Time:</strong> {{scheduledTime}}</li></ul>	TechnicianAssigned	t	2026-06-03 10:33:12.063	2026-06-03 11:52:29.13
bf2aa5a9-9309-4b7d-a412-9d1c9da0a640	inspection-scheduled-user-inapp	Inspection Scheduled — User In-App	InApp	Inspection scheduled	{{requestNumber}} confirmed for {{scheduledDateLabel}} at {{scheduledTime}}.	\N	ServiceRequested	t	2026-06-03 09:24:46.864	2026-06-03 11:52:29.138
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: notification; Owner: postgres
--

COPY notification.notifications (id, "userId", "customerId", "recipientEmail", "recipientPhone", channel, category, subject, body, status, "eventType", "eventPayload", "templateId", "seenAt", "acknowledgedAt", "sentAt", "failedAt", "failureReason", "resendCount", metadata, "createdAt", "updatedAt") FROM stdin;
13a8e267-7613-447e-a8e3-30c6a778d674	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Asset	New extinguisher registered	Fire extinguisher FE-57566 has been registered. Expires on 2026-06-03T12:00:00.000Z.	Sent	AssetCreated	{"status": "Active", "assetId": "76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b", "assetCode": "FE-57566", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-03T12:00:00.000Z"}	78aaff98-24cf-4f07-850f-47bfba380955	2026-06-03 08:29:28.577	\N	2026-06-03 08:27:22.518	\N	\N	0	\N	2026-06-03 08:27:22.516	2026-06-03 08:29:28.578
a4c49475-f57c-46dd-8c23-3a409538f2db	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Asset	New extinguisher registered	Fire extinguisher FE-29809 has been registered. Expires on 2026-06-02T12:00:00.000Z.	Sent	AssetCreated	{"status": "Active", "assetId": "caab1f54-8624-464a-aae9-afaa6209b762", "assetCode": "FE-29809", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-02T12:00:00.000Z"}	78aaff98-24cf-4f07-850f-47bfba380955	2026-06-03 08:29:29.254	\N	2026-06-03 08:26:26.656	\N	\N	0	\N	2026-06-03 08:26:26.65	2026-06-03 08:29:29.255
2881b3e1-6dba-420a-92d6-6392cb51a77e	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-57566 expiring soon	Your fire extinguisher FE-57566 expires on 2026-06-03T12:00:00.000Z. Please schedule inspection or replacement.	Failed	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b", "assetCode": "FE-57566", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-03T12:00:00.000Z"}	93a82217-a295-4c80-92d0-4cc865b95ffb	2026-06-03 08:56:12.516	\N	\N	2026-06-03 08:51:31.677	Recipient email required	0	\N	2026-06-03 08:51:31.675	2026-06-03 08:56:12.517
e24bc397-d4bb-40f4-bdbe-6fb4f7c3384d	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher expiring soon	Extinguisher FE-57566 expires on 2026-06-03T12:00:00.000Z.	Sent	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b", "assetCode": "FE-57566", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-03T12:00:00.000Z"}	7cd2b35d-1013-458d-8002-d793ed5815aa	2026-06-03 08:56:13.054	\N	2026-06-03 08:51:31.686	\N	\N	0	\N	2026-06-03 08:51:31.685	2026-06-03 08:56:13.055
0026ee2d-62d5-4e60-9dcf-b342709d71a9	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Asset	New extinguisher registered	Fire extinguisher FE-51456 has been registered. Expires on 2026-06-04T12:00:00.000Z.	Sent	AssetCreated	{"status": "Active", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "assetCode": "FE-51456", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-04T12:00:00.000Z"}	78aaff98-24cf-4f07-850f-47bfba380955	\N	\N	2026-06-03 09:05:10.081	\N	\N	0	\N	2026-06-03 09:05:10.079	2026-06-03 09:05:10.082
70640ee1-f4de-4833-afb4-0537468d3e76	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-51456 expiring soon	Your fire extinguisher FE-51456 expires on 2026-06-04T12:00:00.000Z. Please schedule inspection or replacement.	Failed	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "assetCode": "FE-51456", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-04T12:00:00.000Z"}	93a82217-a295-4c80-92d0-4cc865b95ffb	\N	\N	\N	2026-06-03 09:08:16.601	Recipient email required	0	\N	2026-06-03 09:08:16.597	2026-06-03 09:08:16.602
31f95a51-72e1-4da3-8ecb-21c0839473bc	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher expiring soon	Extinguisher FE-51456 expires on 2026-06-04T12:00:00.000Z.	Sent	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "assetCode": "FE-51456", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-04T12:00:00.000Z"}	7cd2b35d-1013-458d-8002-d793ed5815aa	\N	\N	2026-06-03 09:08:16.611	\N	\N	0	\N	2026-06-03 09:08:16.609	2026-06-03 09:08:16.612
ed4d7555-41ff-4f73-9320-7c466a03915e	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-29809 — 1 day(s) overdue	Extinguisher FE-29809 expired on 2 June 2026 and is 1 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": null, "assetId": "caab1f54-8624-464a-aae9-afaa6209b762", "alertBody": "Extinguisher FE-29809 expired on 2 June 2026 and is 1 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-29809", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "1", "alertSubject": "Extinguisher FE-29809 — 1 day(s) overdue", "expiryDetail": "expired on 2 June 2026 and is now 1 day(s) overdue", "expiryStatus": "1 day(s) overdue", "daysRemaining": "0", "expirationDate": "2026-06-02", "expirationDateFormatted": "2 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 09:24:46.985	Recipient email required	0	\N	2026-06-03 09:24:46.98	2026-06-03 09:24:46.986
45685cab-45d9-4a25-b133-e1186c10d851	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher FE-29809 — 1 day(s) overdue	Extinguisher FE-29809 expired on 2 June 2026 and is 1 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.	Sent	ExpiryReminder	{"userId": null, "assetId": "caab1f54-8624-464a-aae9-afaa6209b762", "alertBody": "Extinguisher FE-29809 expired on 2 June 2026 and is 1 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-29809", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "1", "alertSubject": "Extinguisher FE-29809 — 1 day(s) overdue", "expiryDetail": "expired on 2 June 2026 and is now 1 day(s) overdue", "expiryStatus": "1 day(s) overdue", "daysRemaining": "0", "expirationDate": "2026-06-02", "expirationDateFormatted": "2 June 2026"}	bbcb1880-9ef2-473a-b945-885cc427faad	\N	\N	2026-06-03 09:24:46.992	\N	\N	0	\N	2026-06-03 09:24:46.991	2026-06-03 09:24:46.993
4c2a563f-34f3-4c85-a11c-ecbeb1b043b1	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-57566 — 1 day(s) until expiry	Extinguisher FE-57566 expires on 3 June 2026 (1 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": null, "assetId": "76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b", "alertBody": "Extinguisher FE-57566 expires on 3 June 2026 (1 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-57566", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "0", "alertSubject": "Extinguisher FE-57566 — 1 day(s) until expiry", "expiryDetail": "expires on 3 June 2026 (1 day(s) remaining)", "expiryStatus": "1 day(s) remaining", "daysRemaining": "1", "expirationDate": "2026-06-03", "expirationDateFormatted": "3 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 09:24:47.007	Recipient email required	0	\N	2026-06-03 09:24:47.005	2026-06-03 09:24:47.007
381f4e52-9f68-476e-91f8-309e2c53445b	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher FE-57566 — 1 day(s) until expiry	Extinguisher FE-57566 expires on 3 June 2026 (1 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Sent	ExpiryReminder	{"userId": null, "assetId": "76b81768-04c8-4c5e-b0be-eb8cfc0d1f8b", "alertBody": "Extinguisher FE-57566 expires on 3 June 2026 (1 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-57566", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "0", "alertSubject": "Extinguisher FE-57566 — 1 day(s) until expiry", "expiryDetail": "expires on 3 June 2026 (1 day(s) remaining)", "expiryStatus": "1 day(s) remaining", "daysRemaining": "1", "expirationDate": "2026-06-03", "expirationDateFormatted": "3 June 2026"}	bbcb1880-9ef2-473a-b945-885cc427faad	\N	\N	2026-06-03 09:24:47.013	\N	\N	0	\N	2026-06-03 09:24:47.012	2026-06-03 09:24:47.014
4c256a31-2382-4504-9603-7574acb0c5f3	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-51456 — 2 day(s) until expiry	Extinguisher FE-51456 expires on 4 June 2026 (2 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": null, "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "alertBody": "Extinguisher FE-51456 expires on 4 June 2026 (2 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-51456", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "0", "alertSubject": "Extinguisher FE-51456 — 2 day(s) until expiry", "expiryDetail": "expires on 4 June 2026 (2 day(s) remaining)", "expiryStatus": "2 day(s) remaining", "daysRemaining": "2", "expirationDate": "2026-06-04", "expirationDateFormatted": "4 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 09:24:47.022	Recipient email required	0	\N	2026-06-03 09:24:47.021	2026-06-03 09:24:47.023
262382d6-8606-4816-b8ea-c9374a2f4b2b	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher FE-51456 — 2 day(s) until expiry	Extinguisher FE-51456 expires on 4 June 2026 (2 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Sent	ExpiryReminder	{"userId": null, "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "alertBody": "Extinguisher FE-51456 expires on 4 June 2026 (2 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-51456", "customerId": "00000000-0000-4000-8000-000000000000", "daysOverdue": "0", "alertSubject": "Extinguisher FE-51456 — 2 day(s) until expiry", "expiryDetail": "expires on 4 June 2026 (2 day(s) remaining)", "expiryStatus": "2 day(s) remaining", "daysRemaining": "2", "expirationDate": "2026-06-04", "expirationDateFormatted": "4 June 2026"}	bbcb1880-9ef2-473a-b945-885cc427faad	\N	\N	2026-06-03 09:24:47.029	\N	\N	0	\N	2026-06-03 09:24:47.028	2026-06-03 09:24:47.03
f283523b-fe24-416c-900b-06cd2c80c4d7	79777821-13f7-475d-bf16-61b0f810ebe5	\N	inspector@fems.local	\N	Email	Service	New inspection scheduled — SR-20260603-5725	A customer scheduled a fire extinguisher inspection.\n\nRequest: SR-20260603-5725\nExtinguisher: 12345 at asthhv\nDate: 4 Jun 2026, 09:00\nTime: 09:00\n\nSign in to the FEMS inspector portal to view assigned work.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "Scheduled inspection", "assetLocation": "asthhv", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "12345", "requestedByUserId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "scheduledDateLabel": "4 Jun 2026, 09:00"}	2b95e32b-f992-4f42-8af1-d420f42d5a1a	\N	\N	\N	2026-06-03 09:39:07.202	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b0e76feasm126899545e9.9 - gsmtp	0	{"html": "<p>A customer scheduled a fire extinguisher inspection.</p><ul><li><strong>Request:</strong> SR-20260603-5725</li><li><strong>Extinguisher:</strong> 12345 — asthhv</li><li><strong>Date:</strong> 4 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul><p>Sign in to the FEMS inspector portal to review pending inspections.</p>"}	2026-06-03 09:39:01.726	2026-06-03 09:39:07.204
c6dcfc6f-8d87-4078-b8a4-2776d8429954	79777821-13f7-475d-bf16-61b0f810ebe5	\N	\N	\N	InApp	Service	New inspection scheduled	SR-20260603-5725: 12345 at asthhv on 4 Jun 2026, 09:00 at 09:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "Scheduled inspection", "assetLocation": "asthhv", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "12345", "requestedByUserId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "scheduledDateLabel": "4 Jun 2026, 09:00"}	729c370b-4f36-4f9e-b6f5-de85016cf528	\N	\N	2026-06-03 09:39:07.216	\N	\N	0	{}	2026-06-03 09:39:07.213	2026-06-03 09:39:07.217
a3ef4a3a-5403-49ca-aedc-f86d91087355	42a7ccfe-3002-45ae-937c-285124dcc45e	\N	\N	\N	Email	Service	New inspection scheduled — SR-20260603-5725	A customer scheduled a fire extinguisher inspection.\n\nRequest: SR-20260603-5725\nExtinguisher:  at Customer site\nDate: 4 Jun 2026, 09:00\nTime: 09:00\n\nSign in to the FEMS inspector portal to view assigned work.	Failed	ServiceRequested	{"assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "42a7ccfe-3002-45ae-937c-285124dcc45e", "assetLocation": "Customer site", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "technicianName": "Prince Murindwa", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "", "scheduledDateLabel": "4 Jun 2026, 09:00"}	2b95e32b-f992-4f42-8af1-d420f42d5a1a	\N	\N	\N	2026-06-03 10:30:32.521	Recipient email required	0	{"html": "<p>A customer scheduled a fire extinguisher inspection.</p><ul><li><strong>Request:</strong> SR-20260603-5725</li><li><strong>Extinguisher:</strong>  — Customer site</li><li><strong>Date:</strong> 4 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul><p>Sign in to the FEMS inspector portal to review pending inspections.</p>"}	2026-06-03 10:30:32.52	2026-06-03 10:30:32.522
255c0884-d06b-4bdb-8b2a-33030332f327	42a7ccfe-3002-45ae-937c-285124dcc45e	\N	princechristianmulindwa@gmail.com	\N	Email	Service	New inspection scheduled — SR-20260603-5725	A customer scheduled a fire extinguisher inspection.\n\nRequest: SR-20260603-5725\nExtinguisher: 12345 at asthhv\nDate: 4 Jun 2026, 09:00\nTime: 09:00\n\nSign in to the FEMS inspector portal to view assigned work.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "Scheduled inspection", "assetLocation": "asthhv", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "12345", "requestedByUserId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "scheduledDateLabel": "4 Jun 2026, 09:00"}	2b95e32b-f992-4f42-8af1-d420f42d5a1a	\N	\N	\N	2026-06-03 09:39:08.908	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2dc412sm6599917f8f.4 - gsmtp	0	{"html": "<p>A customer scheduled a fire extinguisher inspection.</p><ul><li><strong>Request:</strong> SR-20260603-5725</li><li><strong>Extinguisher:</strong> 12345 — asthhv</li><li><strong>Date:</strong> 4 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul><p>Sign in to the FEMS inspector portal to review pending inspections.</p>"}	2026-06-03 09:39:07.223	2026-06-03 09:39:08.909
e0e41423-36b4-4283-b58e-1cf2d1d69e8c	42a7ccfe-3002-45ae-937c-285124dcc45e	\N	\N	\N	InApp	Service	New inspection scheduled	SR-20260603-5725: 12345 at asthhv on 4 Jun 2026, 09:00 at 09:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "Scheduled inspection", "assetLocation": "asthhv", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "12345", "requestedByUserId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "scheduledDateLabel": "4 Jun 2026, 09:00"}	729c370b-4f36-4f9e-b6f5-de85016cf528	\N	\N	2026-06-03 09:39:08.92	\N	\N	0	{}	2026-06-03 09:39:08.917	2026-06-03 09:39:08.921
87ca0fec-a75b-43cb-95b6-9f9c23289e56	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Service	Inspection confirmed — SR-20260603-5725	Your fire extinguisher inspection is scheduled.\n\nRequest: SR-20260603-5725\nExtinguisher: 12345 at asthhv\nDate: 4 Jun 2026, 09:00\nTime: 09:00\n\nAn inspector will be notified. You can track status in your FEMS account.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "Scheduled inspection", "assetLocation": "asthhv", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "12345", "requestedByUserId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "scheduledDateLabel": "4 Jun 2026, 09:00"}	36739e41-2a8e-42e7-9a3f-49197af0ff33	\N	\N	\N	2026-06-03 09:39:10.96	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2ec711sm5913683f8f.12 - gsmtp	0	{"html": "<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> SR-20260603-5725</li><li><strong>Extinguisher:</strong> 12345 — asthhv</li><li><strong>Date:</strong> 4 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul>"}	2026-06-03 09:39:08.933	2026-06-03 09:39:10.961
c469ea02-af61-4f99-9dcd-887646306089	\N	00000000-0000-4000-8000-000000000000	\N	\N	Email	Expiry	Extinguisher FE-51456 expiring soon	Your fire extinguisher FE-51456 expires on 2026-06-04T12:00:00.000Z. Please schedule inspection or replacement.	Failed	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "assetCode": "FE-51456", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-04T12:00:00.000Z"}	93a82217-a295-4c80-92d0-4cc865b95ffb	\N	\N	\N	2026-06-03 09:56:08.795	Recipient email required	0	{}	2026-06-03 09:56:08.778	2026-06-03 09:56:08.797
82cfacb5-db2c-47a2-9f6d-b51f18312617	\N	00000000-0000-4000-8000-000000000000	\N	\N	InApp	Expiry	Extinguisher expiring soon	Extinguisher FE-51456 expires on 2026-06-04T12:00:00.000Z.	Sent	AssetExpiringSoon	{"status": "ExpiringSoon", "assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "assetCode": "FE-51456", "productId": "manual", "customerId": "00000000-0000-4000-8000-000000000000", "expirationDate": "2026-06-04T12:00:00.000Z"}	7cd2b35d-1013-458d-8002-d793ed5815aa	\N	\N	2026-06-03 09:56:08.807	\N	\N	0	{}	2026-06-03 09:56:08.806	2026-06-03 09:56:08.809
efe44528-5d90-48a2-9cce-1872beeec147	42a7ccfe-3002-45ae-937c-285124dcc45e	\N	\N	\N	InApp	Service	New inspection scheduled	SR-20260603-5725:  at Customer site on 4 Jun 2026, 09:00 at 09:00.	Sent	ServiceRequested	{"assetId": "cc60f726-359f-4e00-9143-cbcc0eb87266", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "42a7ccfe-3002-45ae-937c-285124dcc45e", "assetLocation": "Customer site", "requestNumber": "SR-20260603-5725", "scheduledDate": "2026-06-04T19:00:00.000Z", "scheduledTime": "09:00", "technicianName": "Prince Murindwa", "serviceRequestId": "f98bf1c0-f11e-4fbf-b930-aecea8347d60", "assetSerialNumber": "", "scheduledDateLabel": "4 Jun 2026, 09:00"}	729c370b-4f36-4f9e-b6f5-de85016cf528	\N	\N	2026-06-03 10:30:32.514	\N	\N	0	{}	2026-06-03 10:30:32.51	2026-06-03 10:30:32.515
98661335-3a4c-4449-b5fc-1dcd5e5ab709	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Service	Inspection confirmed — SR-20260603-7385	Your fire extinguisher inspection is scheduled.\n\nRequest: SR-20260603-7385\nExtinguisher: 123456789 at Nyabihu,Rwanda\nDate: 6 Jun 2026, 11:00\nTime: 11:00\n\nAn inspector will be notified. You can track status in your FEMS account.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "schedule", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-7385", "scheduledDate": "2026-06-06T21:00:00.000Z", "scheduledTime": "11:00", "notifyAdminsOnly": true, "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "6 Jun 2026, 11:00"}	36739e41-2a8e-42e7-9a3f-49197af0ff33	\N	\N	\N	2026-06-03 11:47:44.172	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3446aesm8169793f8f.24 - gsmtp	0	{"html": "<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> SR-20260603-7385</li><li><strong>Extinguisher:</strong> 123456789 — Nyabihu,Rwanda</li><li><strong>Date:</strong> 6 Jun 2026, 11:00</li><li><strong>Time:</strong> 11:00</li></ul>"}	2026-06-03 11:47:41.449	2026-06-03 11:47:44.173
d3bc6bdf-69ce-4fa7-80d5-148fdc7fa6b9	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Expiry	Extinguisher FE-95298 — expires in 8 day(s)	Your fire extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.	Failed	ExpiryReminder	{"status": "Active", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "alertBody": "Your fire extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.", "assetCode": "FE-95298", "productId": "manual", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "alertSubject": "Extinguisher FE-95298 — expires in 8 day(s)", "daysRemaining": "8", "expirationDate": "2026-06-10", "assignedUserIds": ["3d3d62a2-8c57-443b-b3b0-7c18d30a8489"], "expirationDateFormatted": "10 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:03:59.431	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b63fbcb7sm45815655e9.15 - gsmtp	0	{"html": "<p>Your fire extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.</p><p><strong>Extinguisher:</strong> FE-95298<br/><strong>Expiry date:</strong> 10 June 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:03:57.983	2026-06-03 11:03:59.433
10e4e99e-c9e6-4b2e-85eb-ef0dddaea6e3	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Expiry	Extinguisher FE-95298 — 8 day(s) until expiry	Extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": "3d3d62a2-8c57-443b-b3b0-7c18d30a8489", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "alertBody": "Extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-95298", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "daysOverdue": "0", "alertSubject": "Extinguisher FE-95298 — 8 day(s) until expiry", "expiryDetail": "expires on 10 June 2026 (8 day(s) remaining)", "expiryStatus": "8 day(s) remaining", "daysRemaining": "8", "expirationDate": "2026-06-10", "expirationDateFormatted": "10 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:04:00.858	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f344558sm6910254f8f.18 - gsmtp	0	{"html": "<p>Extinguisher FE-95298 expires on 10 June 2026 (8 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.</p><p><strong>Extinguisher:</strong> FE-95298<br/><strong>Expiry date:</strong> 10 June 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:03:59.498	2026-06-03 11:04:00.859
82430e04-b3c5-4b50-bf22-e08898de2d67	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Service	Inspection confirmed — SR-20260603-1718	Your fire extinguisher inspection is scheduled.\n\nRequest: SR-20260603-1718\nExtinguisher: 123456789 at Nyabihu,Rwanda\nDate: 5 Jun 2026, 09:00\nTime: 09:00\n\nAn inspector will be notified. You can track status in your FEMS account.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "annual compliance check", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-1718", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "notifyAdminsOnly": true, "serviceRequestId": "5811a806-ec12-4b4e-bcbc-30048fcf71d4", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "5 Jun 2026, 09:00"}	36739e41-2a8e-42e7-9a3f-49197af0ff33	\N	\N	\N	2026-06-03 11:16:33.137	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b616d6a9sm52390705e9.7 - gsmtp	0	{"html": "<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> SR-20260603-1718</li><li><strong>Extinguisher:</strong> 123456789 — Nyabihu,Rwanda</li><li><strong>Date:</strong> 5 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul>"}	2026-06-03 11:16:31.576	2026-06-03 11:16:33.138
78dc157b-8498-40c8-9e87-0f00e2ce0700	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Asset	New extinguisher registered	Fire extinguisher FE-67587 has been registered. Expires on 2026-06-19T12:00:00.000Z.	Sent	AssetCreated	{"status": "ExpiringSoon", "assetId": "04ca9126-5bd6-4f39-9258-b8ab31252168", "assetCode": "FE-67587", "productId": "manual", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "expirationDate": "2026-06-19T12:00:00.000Z", "assignedUserIds": ["2e1cafaa-d817-44b2-805e-2fa54640e4ee"]}	78aaff98-24cf-4f07-850f-47bfba380955	2026-06-03 11:43:42.458	\N	2026-06-03 11:19:12.17	\N	\N	0	{}	2026-06-03 11:19:12.167	2026-06-03 11:43:42.459
c3e1e9c2-217c-4689-9161-2501222b63fd	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Expiry	Extinguisher FE-67587 — expires in 17 day(s)	Your fire extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.	Failed	ExpiryReminder	{"status": "ExpiringSoon", "assetId": "04ca9126-5bd6-4f39-9258-b8ab31252168", "alertBody": "Your fire extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.", "assetCode": "FE-67587", "productId": "manual", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "alertSubject": "Extinguisher FE-67587 — expires in 17 day(s)", "daysRemaining": "17", "expirationDate": "2026-06-19", "assignedUserIds": ["2e1cafaa-d817-44b2-805e-2fa54640e4ee"], "expirationDateFormatted": "19 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:19:13.747	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2dcbe3sm6606343f8f.8 - gsmtp	0	{"html": "<p>Your fire extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Sign in to FEMS to book a refill or schedule an inspection.</p><p><strong>Extinguisher:</strong> FE-67587<br/><strong>Expiry date:</strong> 19 June 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:19:12.198	2026-06-03 11:19:13.748
21b2c103-c681-4865-946e-f55ad8f59af4	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection scheduled	SR-20260603-7385 confirmed for 6 Jun 2026, 11:00 at 11:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "schedule", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-7385", "scheduledDate": "2026-06-06T21:00:00.000Z", "scheduledTime": "11:00", "notifyAdminsOnly": true, "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "6 Jun 2026, 11:00"}	bf2aa5a9-9309-4b7d-a412-9d1c9da0a640	\N	\N	2026-06-03 11:47:44.191	\N	\N	0	{}	2026-06-03 11:47:44.188	2026-06-03 11:47:44.191
d338d14d-7b1b-419c-b5e2-b74e97e8c04e	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	\N	\N	\N	InApp	Service	Inspection assigned to you	SR-20260603-7385: 123456789 at Nyabihu,Rwanda on 6 Jun 2026, 11:00 at 11:00. Open Inspections to start.	Sent	TechnicianAssigned	{"assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "assetLocation": "Nyabihu,Rwanda", "inspectorName": "Prince Christian", "requestNumber": "SR-20260603-7385", "scheduledDate": "2026-06-06T21:00:00.000Z", "scheduledTime": "11:00", "technicianName": "Prince Christian", "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "assetSerialNumber": "123456789", "scheduledDateLabel": "6 Jun 2026, 11:00"}	e39e2586-6b4a-47aa-b882-51080255c078	\N	\N	2026-06-03 11:49:18.478	\N	\N	0	{}	2026-06-03 11:49:18.474	2026-06-03 11:49:18.479
8591ad34-5fb5-492c-90e8-12264f97e592	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Expiry	Extinguisher FE-67587 — 17 day(s) until expiry	Extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "assetId": "04ca9126-5bd6-4f39-9258-b8ab31252168", "alertBody": "Extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "FE-67587", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "daysOverdue": "0", "alertSubject": "Extinguisher FE-67587 — 17 day(s) until expiry", "expiryDetail": "expires on 19 June 2026 (17 day(s) remaining)", "expiryStatus": "17 day(s) remaining", "daysRemaining": "17", "expirationDate": "2026-06-19", "expirationDateFormatted": "19 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:19:15.384	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f345209sm6608792f8f.17 - gsmtp	0	{"html": "<p>Extinguisher FE-67587 expires on 19 June 2026 (17 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.</p><p><strong>Extinguisher:</strong> FE-67587<br/><strong>Expiry date:</strong> 19 June 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:19:13.862	2026-06-03 11:19:15.385
e766c154-6b7f-4ef5-82ec-851c2d722a2e	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	\N	princechristianmulindwa@gmail.com	\N	Email	Service	Inspection assigned — SR-20260603-7385	An administrator assigned you inspection SR-20260603-7385.\n\nExtinguisher: 123456789 at Nyabihu,Rwanda\nDate: 6 Jun 2026, 11:00\nTime: 11:00\n\nSign in to FEMS to start the visit.	Failed	TechnicianAssigned	{"assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "assetLocation": "Nyabihu,Rwanda", "inspectorName": "Prince Christian", "requestNumber": "SR-20260603-7385", "scheduledDate": "2026-06-06T21:00:00.000Z", "scheduledTime": "11:00", "technicianName": "Prince Christian", "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "assetSerialNumber": "123456789", "scheduledDateLabel": "6 Jun 2026, 11:00"}	8646c184-ab03-4201-85b6-fce81e95c987	\N	\N	\N	2026-06-03 11:49:20.524	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3444fesm7794064f8f.20 - gsmtp	0	{"html": "<p>You have been assigned inspection <strong>SR-20260603-7385</strong>.</p><ul><li><strong>Extinguisher:</strong> 123456789 — Nyabihu,Rwanda</li><li><strong>Date:</strong> 6 Jun 2026, 11:00</li><li><strong>Time:</strong> 11:00</li></ul>"}	2026-06-03 11:49:18.483	2026-06-03 11:49:20.525
91844efe-c572-4ee0-8b34-0570cafa2ddb	b1000000-0002-4000-8000-000000000002	\N	inspector@fems.local	\N	Email	Service	Inspection assigned — INSP-SEED-001	An administrator assigned you inspection INSP-SEED-001.\n\nExtinguisher: SN-DEMO-001 at Ground floor — reception\nDate: 10 Jun 2026, 01:51\nTime: 10:00\n\nSign in to FEMS to start the visit.	Failed	TechnicianAssigned	{"assetId": "c1000000-0001-4000-8000-000000000001", "customerId": "a1000000-0001-4000-8000-000000000001", "technicianId": "b1000000-0002-4000-8000-000000000002", "assetLocation": "Ground floor — reception", "inspectorName": "Field Inspector", "requestNumber": "INSP-SEED-001", "scheduledDate": "2026-06-10T11:51:20.746Z", "scheduledTime": "10:00", "technicianName": "Demo Inspector", "serviceRequestId": "d1000000-0001-4000-8000-000000000001", "assetSerialNumber": "SN-DEMO-001", "scheduledDateLabel": "10 Jun 2026, 01:51"}	8646c184-ab03-4201-85b6-fce81e95c987	\N	\N	\N	2026-06-03 11:51:47.636	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b0e88fdesm144673315e9.14 - gsmtp	0	{"html": "<p>You have been assigned inspection <strong>INSP-SEED-001</strong>.</p><ul><li><strong>Extinguisher:</strong> SN-DEMO-001 — Ground floor — reception</li><li><strong>Date:</strong> 10 Jun 2026, 01:51</li><li><strong>Time:</strong> 10:00</li></ul>"}	2026-06-03 11:51:45.08	2026-06-03 11:51:47.637
d0cdd3e9-95b1-48cc-9a0e-5a4796a5d154	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	\N	\N	\N	Email	Service	Inspection assigned — SR-20260603-1718	An administrator assigned you inspection SR-20260603-1718.\n\nExtinguisher: 803c4c2c at Customer site\nDate: 5 Jun 2026, 09:00\nTime: 09:00\n\nSign in to FEMS to start the visit.	Failed	TechnicianAssigned	{"assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "assetLocation": "Customer site", "requestNumber": "SR-20260603-1718", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "technicianName": "Prince Christian", "serviceRequestId": "5811a806-ec12-4b4e-bcbc-30048fcf71d4", "assetSerialNumber": "803c4c2c", "scheduledDateLabel": "5 Jun 2026, 09:00"}	8646c184-ab03-4201-85b6-fce81e95c987	\N	\N	\N	2026-06-03 11:19:35.528	Recipient email required	0	{"html": "<p>You have been assigned inspection <strong>SR-20260603-1718</strong>.</p><ul><li><strong>Extinguisher:</strong> 803c4c2c — Customer site</li><li><strong>Date:</strong> 5 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul>"}	2026-06-03 11:19:35.525	2026-06-03 11:19:35.529
0bbdced2-b4c3-4a03-aea3-916da6bc8f41	d1cae370-f0a9-40ea-b662-73b459d4af56	\N	\N	\N	InApp	Service	Inspection completed	SR-20260603-7385: Damaged — maintenance opened.	Sent	ServiceCompleted	{"passed": "false", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "requestNumber": "SR-20260603-7385", "maintenanceNote": " — maintenance opened", "inspectionResult": "Damaged", "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "maintenanceRequired": "true"}	1d874adf-bf4c-4f53-a831-cb1ef2fe8ae4	\N	\N	2026-06-03 11:50:57.76	\N	\N	0	{}	2026-06-03 11:50:57.756	2026-06-03 11:50:57.761
n1000000-0001-4000-8000-000000000001	b1000000-0002-4000-8000-000000000002	\N	\N	\N	InApp	Service	Inspection assigned — INSP-SEED-002	You were assigned inspection INSP-SEED-002 for SN-DEMO-002 at Level 2 — server room.	Sent	TechnicianAssigned	{"requestNumber": "INSP-SEED-002", "serviceRequestId": "d1000000-0002-4000-8000-000000000002"}	\N	\N	\N	2026-06-03 11:36:42.211	\N	\N	0	\N	2026-06-03 11:36:42.213	2026-06-03 11:36:42.213
n1000000-0002-4000-8000-000000000002	b1000000-0003-4000-8000-000000000003	\N	\N	\N	InApp	Service	Inspection completed — passed	Your inspection INSP-SEED-004 for TZW-FE-001 passed.	Sent	ServiceCompleted	{"assetId": "c1000000-0001-4000-8000-000000000001", "requestNumber": "INSP-SEED-004"}	\N	\N	\N	2026-06-01 11:36:42.211	\N	\N	0	\N	2026-06-03 11:36:42.213	2026-06-03 11:36:42.213
n1000000-0003-4000-8000-000000000003	b1000000-0003-4000-8000-000000000003	\N	\N	\N	InApp	Expiry	Extinguisher expiring soon	SN-DEMO-002 at Level 2 — server room expires in under 30 days.	Sent	AssetExpiringSoon	{"assetId": "c1000000-0002-4000-8000-000000000002", "assetCode": "TZW-FE-002"}	\N	\N	\N	2026-06-02 11:36:42.211	\N	\N	0	\N	2026-06-03 11:36:42.213	2026-06-03 11:36:42.213
19162b93-d949-4497-8901-002bb374df2c	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	\N	\N	\N	InApp	Service	Inspection assigned to you	SR-20260603-1718: 803c4c2c at Customer site on 5 Jun 2026, 09:00 at 09:00. Open Inspections to start.	Sent	TechnicianAssigned	{"assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "assetLocation": "Customer site", "requestNumber": "SR-20260603-1718", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "technicianName": "Prince Christian", "serviceRequestId": "5811a806-ec12-4b4e-bcbc-30048fcf71d4", "assetSerialNumber": "803c4c2c", "scheduledDateLabel": "5 Jun 2026, 09:00"}	e39e2586-6b4a-47aa-b882-51080255c078	2026-06-03 11:42:11.319	\N	2026-06-03 11:19:35.518	\N	\N	0	{}	2026-06-03 11:19:35.515	2026-06-03 11:42:11.32
0b4b442b-4be8-4fff-9824-b5edc5f31029	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection completed	SR-20260603-1718 result: Passed.	Sent	ServiceCompleted	{"passed": "true", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "requestNumber": "SR-20260603-1718", "maintenanceNote": "", "inspectionResult": "Passed", "serviceRequestId": "5811a806-ec12-4b4e-bcbc-30048fcf71d4", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "maintenanceRequired": "false"}	4e8af633-e1c9-4c60-99fc-5ceaac63c40c	2026-06-03 11:43:42.458	\N	2026-06-03 11:21:19.311	\N	\N	0	{}	2026-06-03 11:21:19.309	2026-06-03 11:43:42.459
ece6ca44-45c8-4969-a770-e1a2ed1e0581	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection scheduled	SR-20260603-3792 confirmed for 5 Jun 2026, 09:00 at 09:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "04ca9126-5bd6-4f39-9258-b8ab31252168", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "hi there", "assetLocation": "Rubavu", "requestNumber": "SR-20260603-3792", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "notifyAdminsOnly": true, "serviceRequestId": "2d9d7453-efaa-4927-a3e3-8cfdd007ce4f", "assetSerialNumber": "1234321", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "5 Jun 2026, 09:00"}	bf2aa5a9-9309-4b7d-a412-9d1c9da0a640	2026-06-03 11:43:42.458	\N	2026-06-03 11:43:31.523	\N	\N	0	{}	2026-06-03 11:43:31.518	2026-06-03 11:43:42.459
3658629d-8cca-402b-85b3-f68853763b64	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Service	Inspection confirmed — SR-20260603-5460	Your fire extinguisher inspection is scheduled.\n\nRequest: SR-20260603-5460\nExtinguisher: 123456789 at Nyabihu,Rwanda\nDate: 4 Jun 2026, 10:00\nTime: 10:00\n\nAn inspector will be notified. You can track status in your FEMS account.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "hiiiiii", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-5460", "scheduledDate": "2026-06-04T20:00:00.000Z", "scheduledTime": "10:00", "notifyAdminsOnly": true, "serviceRequestId": "0c8996ae-5ca2-46f0-a95d-3186814d7323", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "4 Jun 2026, 10:00"}	36739e41-2a8e-42e7-9a3f-49197af0ff33	\N	\N	\N	2026-06-03 11:43:01.107	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f3529e0sm7133336f8f.28 - gsmtp	0	{"html": "<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> SR-20260603-5460</li><li><strong>Extinguisher:</strong> 123456789 — Nyabihu,Rwanda</li><li><strong>Date:</strong> 4 Jun 2026, 10:00</li><li><strong>Time:</strong> 10:00</li></ul>"}	2026-06-03 11:42:59.555	2026-06-03 11:43:01.109
719f5839-a925-4f49-900c-49183729e5aa	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection completed	SR-20260603-7385 result: Damaged.	Sent	ServiceCompleted	{"passed": "false", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "technicianId": "ba5e4579-90b5-4fd9-a440-81c31cb7c8c9", "requestNumber": "SR-20260603-7385", "maintenanceNote": " — maintenance opened", "inspectionResult": "Damaged", "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "maintenanceRequired": "true"}	4e8af633-e1c9-4c60-99fc-5ceaac63c40c	\N	\N	2026-06-03 11:50:57.791	\N	\N	0	{}	2026-06-03 11:50:57.79	2026-06-03 11:50:57.792
07356a0e-cc03-43a3-9f0b-04733af7795b	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	\N	Email	Service	Inspection confirmed — SR-20260603-3792	Your fire extinguisher inspection is scheduled.\n\nRequest: SR-20260603-3792\nExtinguisher: 1234321 at Rubavu\nDate: 5 Jun 2026, 09:00\nTime: 09:00\n\nAn inspector will be notified. You can track status in your FEMS account.	Failed	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "04ca9126-5bd6-4f39-9258-b8ab31252168", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "hi there", "assetLocation": "Rubavu", "requestNumber": "SR-20260603-3792", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "notifyAdminsOnly": true, "serviceRequestId": "2d9d7453-efaa-4927-a3e3-8cfdd007ce4f", "assetSerialNumber": "1234321", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "5 Jun 2026, 09:00"}	36739e41-2a8e-42e7-9a3f-49197af0ff33	\N	\N	\N	2026-06-03 11:43:31.46	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-490b615fac0sm48747755e9.4 - gsmtp	0	{"html": "<p>Your fire extinguisher inspection is confirmed.</p><ul><li><strong>Request:</strong> SR-20260603-3792</li><li><strong>Extinguisher:</strong> 1234321 — Rubavu</li><li><strong>Date:</strong> 5 Jun 2026, 09:00</li><li><strong>Time:</strong> 09:00</li></ul>"}	2026-06-03 11:43:29.952	2026-06-03 11:43:31.462
613d3ee5-3cc6-48cc-a00e-60b2a7ecad7b	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection scheduled	SR-20260603-1718 confirmed for 5 Jun 2026, 09:00 at 09:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "annual compliance check", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-1718", "scheduledDate": "2026-06-05T19:00:00.000Z", "scheduledTime": "09:00", "notifyAdminsOnly": true, "serviceRequestId": "5811a806-ec12-4b4e-bcbc-30048fcf71d4", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "5 Jun 2026, 09:00"}	bf2aa5a9-9309-4b7d-a412-9d1c9da0a640	2026-06-03 11:43:42.458	\N	2026-06-03 11:16:33.199	\N	\N	0	{}	2026-06-03 11:16:33.195	2026-06-03 11:43:42.459
ec6305f0-aec4-44ba-8cad-0eb2b65c12b8	2e1cafaa-d817-44b2-805e-2fa54640e4ee	665891f8-710a-4092-9d88-998b9ab6a95b	bettyndinabo@gmail.com	N/A	InApp	Service	Inspection scheduled	SR-20260603-5460 confirmed for 4 Jun 2026, 10:00 at 10:00.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "hiiiiii", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-5460", "scheduledDate": "2026-06-04T20:00:00.000Z", "scheduledTime": "10:00", "notifyAdminsOnly": true, "serviceRequestId": "0c8996ae-5ca2-46f0-a95d-3186814d7323", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "4 Jun 2026, 10:00"}	bf2aa5a9-9309-4b7d-a412-9d1c9da0a640	2026-06-03 11:43:42.458	\N	2026-06-03 11:43:01.121	\N	\N	0	{}	2026-06-03 11:43:01.119	2026-06-03 11:43:42.459
00001199-1ee8-473a-9d4d-66f31dfcf961	b1000000-0003-4000-8000-000000000003	a1000000-0001-4000-8000-000000000001	user@fems.local	\N	Email	Expiry	Extinguisher TZW-FE-003 — 46 day(s) overdue	Extinguisher TZW-FE-003 expired on 19 April 2026 and is 46 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": "b1000000-0003-4000-8000-000000000003", "assetId": "c1000000-0003-4000-8000-000000000003", "alertBody": "Extinguisher TZW-FE-003 expired on 19 April 2026 and is 46 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "TZW-FE-003", "customerId": "a1000000-0001-4000-8000-000000000001", "daysOverdue": "46", "alertSubject": "Extinguisher TZW-FE-003 — 46 day(s) overdue", "expiryDetail": "expired on 19 April 2026 and is now 46 day(s) overdue", "expiryStatus": "46 day(s) overdue", "daysRemaining": "0", "expirationDate": "2026-04-19", "expirationDateFormatted": "19 April 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:44:38.357	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f2ed944sm7237515f8f.13 - gsmtp	0	{"html": "<p>Extinguisher TZW-FE-003 expired on 19 April 2026 and is 46 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.</p><p><strong>Extinguisher:</strong> TZW-FE-003<br/><strong>Expiry date:</strong> 19 April 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:44:29.849	2026-06-03 11:44:38.36
57788cf2-1030-4736-b0b7-e99c17f6070c	b1000000-0002-4000-8000-000000000002	\N	\N	\N	InApp	Service	Inspection assigned to you	INSP-SEED-001: SN-DEMO-001 at Ground floor — reception on 10 Jun 2026, 01:51 at 10:00. Open Inspections to start.	Sent	TechnicianAssigned	{"assetId": "c1000000-0001-4000-8000-000000000001", "customerId": "a1000000-0001-4000-8000-000000000001", "technicianId": "b1000000-0002-4000-8000-000000000002", "assetLocation": "Ground floor — reception", "inspectorName": "Field Inspector", "requestNumber": "INSP-SEED-001", "scheduledDate": "2026-06-10T11:51:20.746Z", "scheduledTime": "10:00", "technicianName": "Demo Inspector", "serviceRequestId": "d1000000-0001-4000-8000-000000000001", "assetSerialNumber": "SN-DEMO-001", "scheduledDateLabel": "10 Jun 2026, 01:51"}	e39e2586-6b4a-47aa-b882-51080255c078	\N	\N	2026-06-03 11:51:45.074	\N	\N	0	{}	2026-06-03 11:51:45.073	2026-06-03 11:51:45.075
7dd4fb16-1e7d-41f1-aaa9-bce61849f21f	b1000000-0003-4000-8000-000000000003	a1000000-0001-4000-8000-000000000001	user@fems.local	+254712345678	InApp	Expiry	Extinguisher TZW-FE-003 — 46 day(s) overdue	Extinguisher TZW-FE-003 expired on 19 April 2026 and is 46 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.	Sent	ExpiryReminder	{"userId": "b1000000-0003-4000-8000-000000000003", "assetId": "c1000000-0003-4000-8000-000000000003", "alertBody": "Extinguisher TZW-FE-003 expired on 19 April 2026 and is 46 day(s) overdue. Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "TZW-FE-003", "customerId": "a1000000-0001-4000-8000-000000000001", "daysOverdue": "46", "alertSubject": "Extinguisher TZW-FE-003 — 46 day(s) overdue", "expiryDetail": "expired on 19 April 2026 and is now 46 day(s) overdue", "expiryStatus": "46 day(s) overdue", "daysRemaining": "0", "expirationDate": "2026-04-19", "expirationDateFormatted": "19 April 2026"}	bbcb1880-9ef2-473a-b945-885cc427faad	\N	\N	2026-06-03 11:44:38.392	\N	\N	0	{}	2026-06-03 11:44:38.386	2026-06-03 11:44:38.396
dcf8a745-e660-4da8-a0ce-9e0a0b7cd1b8	b1000000-0003-4000-8000-000000000003	a1000000-0001-4000-8000-000000000001	user@fems.local	\N	Email	Expiry	Extinguisher TZW-FE-002 — 18 day(s) until expiry	Extinguisher TZW-FE-002 expires on 21 June 2026 (18 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Failed	ExpiryReminder	{"userId": "b1000000-0003-4000-8000-000000000003", "assetId": "c1000000-0002-4000-8000-000000000002", "alertBody": "Extinguisher TZW-FE-002 expires on 21 June 2026 (18 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "TZW-FE-002", "customerId": "a1000000-0001-4000-8000-000000000001", "daysOverdue": "0", "alertSubject": "Extinguisher TZW-FE-002 — 18 day(s) until expiry", "expiryDetail": "expires on 21 June 2026 (18 day(s) remaining)", "expiryStatus": "18 day(s) remaining", "daysRemaining": "18", "expirationDate": "2026-06-21", "expirationDateFormatted": "21 June 2026"}	4c199cd8-8a72-4fe9-a923-72739e82723d	\N	\N	\N	2026-06-03 11:44:39.863	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials ffacd0b85a97d-4601f351d69sm11223441f8f.29 - gsmtp	0	{"html": "<p>Extinguisher TZW-FE-002 expires on 21 June 2026 (18 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.</p><p><strong>Extinguisher:</strong> TZW-FE-002<br/><strong>Expiry date:</strong> 21 June 2026</p><p>Sign in to FEMS to book a refill or schedule an inspection.</p>"}	2026-06-03 11:44:38.443	2026-06-03 11:44:39.865
6ae1fce4-91d7-493a-a0b2-f4cecbee24af	b1000000-0003-4000-8000-000000000003	a1000000-0001-4000-8000-000000000001	user@fems.local	+254712345678	InApp	Expiry	Extinguisher TZW-FE-002 — 18 day(s) until expiry	Extinguisher TZW-FE-002 expires on 21 June 2026 (18 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.	Sent	ExpiryReminder	{"userId": "b1000000-0003-4000-8000-000000000003", "assetId": "c1000000-0002-4000-8000-000000000002", "alertBody": "Extinguisher TZW-FE-002 expires on 21 June 2026 (18 day(s) remaining). Open FEMS, mark this alert as read, and book a refill to stop reminders.", "assetCode": "TZW-FE-002", "customerId": "a1000000-0001-4000-8000-000000000001", "daysOverdue": "0", "alertSubject": "Extinguisher TZW-FE-002 — 18 day(s) until expiry", "expiryDetail": "expires on 21 June 2026 (18 day(s) remaining)", "expiryStatus": "18 day(s) remaining", "daysRemaining": "18", "expirationDate": "2026-06-21", "expirationDateFormatted": "21 June 2026"}	bbcb1880-9ef2-473a-b945-885cc427faad	\N	\N	2026-06-03 11:44:39.895	\N	\N	0	{}	2026-06-03 11:44:39.886	2026-06-03 11:44:39.897
b273e677-b277-403d-87b5-a442cf5563d0	d1cae370-f0a9-40ea-b662-73b459d4af56	\N	\N	\N	InApp	Service	New inspection request	SR-20260603-7385: 123456789 at Nyabihu,Rwanda on 6 Jun 2026, 11:00 at 11:00. Assign an inspector.	Sent	ServiceRequested	{"type": "Inspection", "status": "Pending", "assetId": "803c4c2c-46c2-417e-ace6-5b0e15fff962", "customerId": "665891f8-710a-4092-9d88-998b9ab6a95b", "description": "schedule", "assetLocation": "Nyabihu,Rwanda", "requestNumber": "SR-20260603-7385", "scheduledDate": "2026-06-06T21:00:00.000Z", "scheduledTime": "11:00", "notifyAdminsOnly": true, "serviceRequestId": "32ff9f58-c45b-46d4-ad1b-61a454e922fd", "assetSerialNumber": "123456789", "requestedByUserId": "2e1cafaa-d817-44b2-805e-2fa54640e4ee", "scheduledDateLabel": "6 Jun 2026, 11:00"}	59d90c52-dc9e-4cdb-bdfb-7cb456f34507	2026-06-03 11:53:42.527	\N	2026-06-03 11:47:41.438	\N	\N	0	{}	2026-06-03 11:47:41.431	2026-06-03 11:53:42.528
\.


--
-- Data for Name: generated_reports; Type: TABLE DATA; Schema: reporting; Owner: postgres
--

COPY reporting.generated_reports (id, "reportType", title, status, "rowCount", summary, "dataSnapshot", "generatedBy", "errorMessage", "createdAt", "updatedAt") FROM stdin;
7208e548-60ed-43b6-b20d-c2ce428eff36	maintenance_history	Maintenance History	completed	4	{"maintenanceRecords": 4}	{"rows": [{"assetCode": "FE-95298", "actionTaken": "23456", "serviceDate": "2026-06-03T11:51:13.704Z", "serviceType": "Maintenance", "serialNumber": "123456789", "recommendations": "wet", "issuesIdentified": "Damaged"}, {"assetCode": "FE-95298", "actionTaken": "Inspection Failed (damaged)", "serviceDate": "2026-06-03T11:50:57.487Z", "serviceType": "Inspection", "serialNumber": "123456789", "recommendations": null, "issuesIdentified": "damaged"}, {"assetCode": "FE-95298", "actionTaken": "Inspection Passed", "serviceDate": "2026-06-03T11:21:19.166Z", "serviceType": "Inspection", "serialNumber": "123456789", "recommendations": null}, {"assetCode": "FE-51456", "actionTaken": "Inspection Failed (needs_maintenance)", "serviceDate": "2026-06-03T10:31:59.720Z", "serviceType": "Inspection", "serialNumber": "12345", "recommendations": null, "issuesIdentified": "needs_maintenance"}], "columns": ["assetCode", "serialNumber", "serviceType", "actionTaken", "serviceDate", "issuesIdentified"]}	d1cae370-f0a9-40ea-b662-73b459d4af56	\N	2026-06-03 11:53:19.778	2026-06-03 11:53:19.82
\.


--
-- Data for Name: report_exports; Type: TABLE DATA; Schema: reporting; Owner: postgres
--

COPY reporting.report_exports (id, "generatedReportId", format, "filePath", "fileName", "fileSize", "mimeType", "createdAt") FROM stdin;
9578ecb1-4500-473d-87d0-96100f33fb52	7208e548-60ed-43b6-b20d-c2ce428eff36	pdf	C:\\Users\\rca\\Desktop\\FEMS\\services\\reporting-service\\exports\\maintenance-history-7208e548.pdf	maintenance-history-7208e548.pdf	2014	application/pdf	2026-06-03 11:53:21.195
\.


--
-- Data for Name: report_filters; Type: TABLE DATA; Schema: reporting; Owner: postgres
--

COPY reporting.report_filters (id, "generatedReportId", "dateFrom", "dateTo", "customerId", "productType", status, "technicianId", "paymentStatus", "createdAt") FROM stdin;
f2286ea1-d639-4cf4-95ff-db57994773f0	7208e548-60ed-43b6-b20d-c2ce428eff36	2026-06-02 00:00:00	2026-06-05 00:00:00	\N	\N	\N	\N	\N	2026-06-03 11:53:19.778
\.


--
-- Data for Name: service_completions; Type: TABLE DATA; Schema: service_request; Owner: postgres
--

COPY service_request.service_completions (id, "serviceRequestId", "technicianId", "completedAt", summary, "workPerformed", "partsUsed", "nextServiceDate", "nextExpirationDate", "inspectionResult", "maintenanceRequired") FROM stdin;
c25d3953-3da2-4101-8432-4e50c20a35da	f98bf1c0-f11e-4fbf-b930-aecea8347d60	42a7ccfe-3002-45ae-937c-285124dcc45e	2026-06-03 10:31:59.72	Completed — Maintenance Required (Under Maintenance)	Result: Needs Maintenance. Issue: Under Maintenance	weh	2027-06-03 10:31:59.72	\N	Needs Maintenance	t
3c071511-fc6a-4926-a635-259d06e122af	5811a806-ec12-4b4e-bcbc-30048fcf71d4	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	2026-06-03 11:21:19.166	Inspection passed — extinguisher remains Active	All checks passed	12345678	2027-06-03 11:21:19.166	\N	Passed	f
2af117f5-ecdc-4862-8a58-c16e55268bdb	32ff9f58-c45b-46d4-ad1b-61a454e922fd	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	2026-06-03 11:50:57.487	Completed — Maintenance Required (Damaged)	Result: Damaged. Issue: Damaged	235	2027-06-03 11:50:57.487	\N	Damaged	t
54f2ca01-95fc-43ba-ad28-1d8d10a0cff7	d1000000-0004-4000-8000-000000000004	b1000000-0002-4000-8000-000000000002	2026-05-24 11:51:20.751	Inspection completed — unit passed	Visual check, pressure gauge OK, seal intact	\N	\N	\N	pass	f
a918cbe7-2266-4b08-aaa3-a36da330e552	d1000000-0005-4000-8000-000000000005	b1000000-0002-4000-8000-000000000002	2026-05-16 11:51:20.753	Failed inspection — maintenance required	Gauge in red zone, hose cracked	\N	\N	\N	fail	t
\.


--
-- Data for Name: service_notes; Type: TABLE DATA; Schema: service_request; Owner: postgres
--

COPY service_request.service_notes (id, "serviceRequestId", content, "createdBy", "authorRole", "createdAt") FROM stdin;
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: service_request; Owner: postgres
--

COPY service_request.service_requests (id, "requestNumber", "customerId", "assetId", "requestedByUserId", type, status, description, "scheduledDate", "scheduledTime", "notifyUserId", priority, "createdAt", "updatedAt") FROM stdin;
f98bf1c0-f11e-4fbf-b930-aecea8347d60	SR-20260603-5725	665891f8-710a-4092-9d88-998b9ab6a95b	cc60f726-359f-4e00-9143-cbcc0eb87266	3d3d62a2-8c57-443b-b3b0-7c18d30a8489	Inspection	Completed	Scheduled inspection	2026-06-04 19:00:00	09:00	\N	normal	2026-06-03 09:39:01.664	2026-06-03 10:31:59.763
5811a806-ec12-4b4e-bcbc-30048fcf71d4	SR-20260603-1718	665891f8-710a-4092-9d88-998b9ab6a95b	803c4c2c-46c2-417e-ace6-5b0e15fff962	2e1cafaa-d817-44b2-805e-2fa54640e4ee	Inspection	Completed	annual compliance check	2026-06-05 19:00:00	09:00	\N	normal	2026-06-03 11:16:31.455	2026-06-03 11:21:19.209
0c8996ae-5ca2-46f0-a95d-3186814d7323	SR-20260603-5460	665891f8-710a-4092-9d88-998b9ab6a95b	803c4c2c-46c2-417e-ace6-5b0e15fff962	2e1cafaa-d817-44b2-805e-2fa54640e4ee	Inspection	Assigned	hiiiiii	2026-06-04 20:00:00	10:00	\N	normal	2026-06-03 11:42:59.32	2026-06-03 11:44:11.983
2d9d7453-efaa-4927-a3e3-8cfdd007ce4f	SR-20260603-3792	665891f8-710a-4092-9d88-998b9ab6a95b	04ca9126-5bd6-4f39-9258-b8ab31252168	2e1cafaa-d817-44b2-805e-2fa54640e4ee	Inspection	Assigned	hi there	2026-06-05 19:00:00	09:00	\N	normal	2026-06-03 11:43:29.927	2026-06-03 11:44:56.628
d1000000-0004-4000-8000-000000000004	INSP-SEED-004	a1000000-0001-4000-8000-000000000001	c1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	Inspection	Completed	\N	2026-05-20 11:51:20.751	11:00	\N	normal	2026-06-03 11:51:20.752	2026-06-03 11:51:20.752
32ff9f58-c45b-46d4-ad1b-61a454e922fd	SR-20260603-7385	665891f8-710a-4092-9d88-998b9ab6a95b	803c4c2c-46c2-417e-ace6-5b0e15fff962	2e1cafaa-d817-44b2-805e-2fa54640e4ee	Inspection	Completed	schedule	2026-06-06 21:00:00	11:00	\N	normal	2026-06-03 11:47:41.353	2026-06-03 11:50:57.489
d1000000-0002-4000-8000-000000000002	INSP-SEED-002	a1000000-0001-4000-8000-000000000001	c1000000-0002-4000-8000-000000000002	b1000000-0003-4000-8000-000000000003	Inspection	Assigned	Expiring soon — priority inspection	2026-06-06 11:51:20.748	14:30	\N	normal	2026-06-03 11:51:20.749	2026-06-03 11:51:20.749
d1000000-0003-4000-8000-000000000003	INSP-SEED-003	a1000000-0001-4000-8000-000000000001	c1000000-0004-4000-8000-000000000004	b1000000-0003-4000-8000-000000000003	Inspection	InProgress	\N	2026-06-03 11:51:20.75	09:00	\N	normal	2026-06-03 11:51:20.751	2026-06-03 11:51:20.751
d1000000-0005-4000-8000-000000000005	INSP-SEED-005	a1000000-0001-4000-8000-000000000001	c1000000-0003-4000-8000-000000000003	b1000000-0003-4000-8000-000000000003	Inspection	Completed	\N	2026-05-13 11:51:20.753	15:00	\N	normal	2026-06-03 11:51:20.754	2026-06-03 11:51:20.754
d1000000-0001-4000-8000-000000000001	INSP-SEED-001	a1000000-0001-4000-8000-000000000001	c1000000-0001-4000-8000-000000000001	b1000000-0003-4000-8000-000000000003	Inspection	Assigned	Annual inspection requested via portal	2026-06-10 11:51:20.746	10:00	\N	normal	2026-06-03 11:51:20.747	2026-06-03 11:51:45.056
\.


--
-- Data for Name: technician_assignments; Type: TABLE DATA; Schema: service_request; Owner: postgres
--

COPY service_request.technician_assignments (id, "serviceRequestId", "technicianId", "technicianName", "assignedBy", "assignedAt", notes) FROM stdin;
e4d16c52-f326-4db5-819e-b31369ec87d3	f98bf1c0-f11e-4fbf-b930-aecea8347d60	42a7ccfe-3002-45ae-937c-285124dcc45e	Prince Murindwa	kamahorolinda@gmail.com	2026-06-03 10:30:32.412	\N
33dd6527-15c3-43f8-81ce-210e8936be8e	5811a806-ec12-4b4e-bcbc-30048fcf71d4	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	Prince Christian	kamahorolinda@gmail.com	2026-06-03 11:19:35.498	\N
2e6c963e-0bfa-4435-9aa0-946e23ab6673	0c8996ae-5ca2-46f0-a95d-3186814d7323	b1000000-0002-4000-8000-000000000002	Field Inspector	kamahorolinda@gmail.com	2026-06-03 11:44:11.98	\N
13085f2b-c094-4410-b9a5-dd7b8e29265c	2d9d7453-efaa-4927-a3e3-8cfdd007ce4f	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	Prince Christian	kamahorolinda@gmail.com	2026-06-03 11:44:56.628	\N
76612c20-8528-4594-b531-25f86acace2f	32ff9f58-c45b-46d4-ad1b-61a454e922fd	ba5e4579-90b5-4fd9-a440-81c31cb7c8c9	Prince Christian	kamahorolinda@gmail.com	2026-06-03 11:49:18.372	\N
2afad634-1e95-48d2-8979-b28db688a67f	d1000000-0002-4000-8000-000000000002	b1000000-0002-4000-8000-000000000002	Field Inspector	admin@seed	2026-06-03 11:51:20.749	Assigned from demo seed
aee41f9a-1bcd-44d6-a52c-cc9a0f717a33	d1000000-0003-4000-8000-000000000003	b1000000-0002-4000-8000-000000000002	Field Inspector	admin@seed	2026-06-03 11:51:20.751	\N
598639ec-31f0-4656-94e3-7ed0311be3de	d1000000-0004-4000-8000-000000000004	b1000000-0002-4000-8000-000000000002	Field Inspector	\N	2026-06-03 11:51:20.752	\N
fd9a6f54-d0ae-4113-9d7b-16b8c2439c8b	d1000000-0005-4000-8000-000000000005	b1000000-0002-4000-8000-000000000002	Field Inspector	\N	2026-06-03 11:51:20.754	\N
bba7ff1f-d7d7-44ac-acc6-23f853328450	d1000000-0001-4000-8000-000000000001	b1000000-0002-4000-8000-000000000002	Demo Inspector	kamahorolinda@gmail.com	2026-06-03 11:51:45.056	\N
\.


--
-- Name: asset_histories asset_histories_pkey; Type: CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_histories
    ADD CONSTRAINT asset_histories_pkey PRIMARY KEY (id);


--
-- Name: asset_service_records asset_service_records_pkey; Type: CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_service_records
    ADD CONSTRAINT asset_service_records_pkey PRIMARY KEY (id);


--
-- Name: asset_user_assignments asset_user_assignments_pkey; Type: CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_user_assignments
    ADD CONSTRAINT asset_user_assignments_pkey PRIMARY KEY (id);


--
-- Name: fire_extinguisher_assets fire_extinguisher_assets_pkey; Type: CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.fire_extinguisher_assets
    ADD CONSTRAINT fire_extinguisher_assets_pkey PRIMARY KEY (id);


--
-- Name: maintenance_tasks maintenance_tasks_pkey; Type: CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.maintenance_tasks
    ADD CONSTRAINT maintenance_tasks_pkey PRIMARY KEY (id);


--
-- Name: auth_audit_logs auth_audit_logs_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auth_audit_logs
    ADD CONSTRAINT auth_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: customer; Owner: postgres
--

ALTER TABLE ONLY customer.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: customer; Owner: postgres
--

ALTER TABLE ONLY customer.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: customer; Owner: postgres
--

ALTER TABLE ONLY customer.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expiry_alert_trackers expiry_alert_trackers_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.expiry_alert_trackers
    ADD CONSTRAINT expiry_alert_trackers_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: generated_reports generated_reports_pkey; Type: CONSTRAINT; Schema: reporting; Owner: postgres
--

ALTER TABLE ONLY reporting.generated_reports
    ADD CONSTRAINT generated_reports_pkey PRIMARY KEY (id);


--
-- Name: report_exports report_exports_pkey; Type: CONSTRAINT; Schema: reporting; Owner: postgres
--

ALTER TABLE ONLY reporting.report_exports
    ADD CONSTRAINT report_exports_pkey PRIMARY KEY (id);


--
-- Name: report_filters report_filters_pkey; Type: CONSTRAINT; Schema: reporting; Owner: postgres
--

ALTER TABLE ONLY reporting.report_filters
    ADD CONSTRAINT report_filters_pkey PRIMARY KEY (id);


--
-- Name: service_completions service_completions_pkey; Type: CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.service_completions
    ADD CONSTRAINT service_completions_pkey PRIMARY KEY (id);


--
-- Name: service_notes service_notes_pkey; Type: CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.service_notes
    ADD CONSTRAINT service_notes_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: technician_assignments technician_assignments_pkey; Type: CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.technician_assignments
    ADD CONSTRAINT technician_assignments_pkey PRIMARY KEY (id);


--
-- Name: asset_histories_assetId_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "asset_histories_assetId_idx" ON asset.asset_histories USING btree ("assetId");


--
-- Name: asset_histories_createdAt_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "asset_histories_createdAt_idx" ON asset.asset_histories USING btree ("createdAt");


--
-- Name: asset_service_records_assetId_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "asset_service_records_assetId_idx" ON asset.asset_service_records USING btree ("assetId");


--
-- Name: asset_service_records_serviceDate_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "asset_service_records_serviceDate_idx" ON asset.asset_service_records USING btree ("serviceDate");


--
-- Name: asset_user_assignments_asset_id_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX asset_user_assignments_asset_id_idx ON asset.asset_user_assignments USING btree (asset_id);


--
-- Name: asset_user_assignments_asset_id_user_id_key; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE UNIQUE INDEX asset_user_assignments_asset_id_user_id_key ON asset.asset_user_assignments USING btree (asset_id, user_id);


--
-- Name: asset_user_assignments_user_id_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX asset_user_assignments_user_id_idx ON asset.asset_user_assignments USING btree (user_id);


--
-- Name: fire_extinguisher_assets_assetCode_key; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE UNIQUE INDEX "fire_extinguisher_assets_assetCode_key" ON asset.fire_extinguisher_assets USING btree ("assetCode");


--
-- Name: fire_extinguisher_assets_customerId_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "fire_extinguisher_assets_customerId_idx" ON asset.fire_extinguisher_assets USING btree ("customerId");


--
-- Name: fire_extinguisher_assets_expirationDate_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "fire_extinguisher_assets_expirationDate_idx" ON asset.fire_extinguisher_assets USING btree ("expirationDate");


--
-- Name: fire_extinguisher_assets_orderId_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "fire_extinguisher_assets_orderId_idx" ON asset.fire_extinguisher_assets USING btree ("orderId");


--
-- Name: fire_extinguisher_assets_productId_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "fire_extinguisher_assets_productId_idx" ON asset.fire_extinguisher_assets USING btree ("productId");


--
-- Name: fire_extinguisher_assets_serialNumber_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX "fire_extinguisher_assets_serialNumber_idx" ON asset.fire_extinguisher_assets USING btree ("serialNumber");


--
-- Name: fire_extinguisher_assets_serialNumber_key; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE UNIQUE INDEX "fire_extinguisher_assets_serialNumber_key" ON asset.fire_extinguisher_assets USING btree ("serialNumber");


--
-- Name: fire_extinguisher_assets_status_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX fire_extinguisher_assets_status_idx ON asset.fire_extinguisher_assets USING btree (status);


--
-- Name: maintenance_tasks_asset_id_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX maintenance_tasks_asset_id_idx ON asset.maintenance_tasks USING btree (asset_id);


--
-- Name: maintenance_tasks_assigned_to_id_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX maintenance_tasks_assigned_to_id_idx ON asset.maintenance_tasks USING btree (assigned_to_id);


--
-- Name: maintenance_tasks_status_idx; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE INDEX maintenance_tasks_status_idx ON asset.maintenance_tasks USING btree (status);


--
-- Name: maintenance_tasks_task_number_key; Type: INDEX; Schema: asset; Owner: postgres
--

CREATE UNIQUE INDEX maintenance_tasks_task_number_key ON asset.maintenance_tasks USING btree (task_number);


--
-- Name: auth_audit_logs_action_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX auth_audit_logs_action_idx ON auth.auth_audit_logs USING btree (action);


--
-- Name: auth_audit_logs_created_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX auth_audit_logs_created_at_idx ON auth.auth_audit_logs USING btree (created_at);


--
-- Name: auth_audit_logs_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX auth_audit_logs_user_id_idx ON auth.auth_audit_logs USING btree (user_id);


--
-- Name: otps_expires_at_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX otps_expires_at_idx ON auth.otps USING btree (expires_at);


--
-- Name: otps_user_id_purpose_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX otps_user_id_purpose_idx ON auth.otps USING btree (user_id, purpose);


--
-- Name: password_reset_tokens_token_hash_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX password_reset_tokens_token_hash_key ON auth.password_reset_tokens USING btree (token_hash);


--
-- Name: password_reset_tokens_user_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX password_reset_tokens_user_id_idx ON auth.password_reset_tokens USING btree (user_id);


--
-- Name: roles_name_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON auth.roles USING btree (name);


--
-- Name: users_customer_id_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX users_customer_id_idx ON auth.users USING btree (customer_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX users_email_idx ON auth.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON auth.users USING btree (email);


--
-- Name: users_google_id_key; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX users_google_id_key ON auth.users USING btree (google_id);


--
-- Name: customer_addresses_customerId_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customer_addresses_customerId_idx" ON customer.customer_addresses USING btree ("customerId");


--
-- Name: customer_notes_customerId_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customer_notes_customerId_idx" ON customer.customer_notes USING btree ("customerId");


--
-- Name: customers_customerType_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customers_customerType_idx" ON customer.customers USING btree ("customerType");


--
-- Name: customers_deletedAt_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customers_deletedAt_idx" ON customer.customers USING btree ("deletedAt");


--
-- Name: customers_email_key; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON customer.customers USING btree (email);


--
-- Name: customers_fullName_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customers_fullName_idx" ON customer.customers USING btree ("fullName");


--
-- Name: customers_phoneNumber_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customers_phoneNumber_idx" ON customer.customers USING btree ("phoneNumber");


--
-- Name: customers_userId_idx; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE INDEX "customers_userId_idx" ON customer.customers USING btree ("userId");


--
-- Name: customers_userId_key; Type: INDEX; Schema: customer; Owner: postgres
--

CREATE UNIQUE INDEX "customers_userId_key" ON customer.customers USING btree ("userId");


--
-- Name: expiry_alert_trackers_assetId_key; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE UNIQUE INDEX "expiry_alert_trackers_assetId_key" ON notification.expiry_alert_trackers USING btree ("assetId");


--
-- Name: expiry_alert_trackers_customerId_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "expiry_alert_trackers_customerId_idx" ON notification.expiry_alert_trackers USING btree ("customerId");


--
-- Name: expiry_alert_trackers_expirationDate_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "expiry_alert_trackers_expirationDate_idx" ON notification.expiry_alert_trackers USING btree ("expirationDate");


--
-- Name: notification_logs_action_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX notification_logs_action_idx ON notification.notification_logs USING btree (action);


--
-- Name: notification_logs_notificationId_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "notification_logs_notificationId_idx" ON notification.notification_logs USING btree ("notificationId");


--
-- Name: notification_templates_channel_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX notification_templates_channel_idx ON notification.notification_templates USING btree (channel);


--
-- Name: notification_templates_code_key; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE UNIQUE INDEX notification_templates_code_key ON notification.notification_templates USING btree (code);


--
-- Name: notification_templates_eventType_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "notification_templates_eventType_idx" ON notification.notification_templates USING btree ("eventType");


--
-- Name: notifications_category_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX notifications_category_idx ON notification.notifications USING btree (category);


--
-- Name: notifications_channel_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX notifications_channel_idx ON notification.notifications USING btree (channel);


--
-- Name: notifications_customerId_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "notifications_customerId_idx" ON notification.notifications USING btree ("customerId");


--
-- Name: notifications_status_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX notifications_status_idx ON notification.notifications USING btree (status);


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON notification.notifications USING btree ("userId");


--
-- Name: generated_reports_createdAt_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX "generated_reports_createdAt_idx" ON reporting.generated_reports USING btree ("createdAt");


--
-- Name: generated_reports_reportType_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX "generated_reports_reportType_idx" ON reporting.generated_reports USING btree ("reportType");


--
-- Name: generated_reports_status_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX generated_reports_status_idx ON reporting.generated_reports USING btree (status);


--
-- Name: report_exports_format_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX report_exports_format_idx ON reporting.report_exports USING btree (format);


--
-- Name: report_exports_generatedReportId_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX "report_exports_generatedReportId_idx" ON reporting.report_exports USING btree ("generatedReportId");


--
-- Name: report_filters_customerId_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX "report_filters_customerId_idx" ON reporting.report_filters USING btree ("customerId");


--
-- Name: report_filters_generatedReportId_key; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE UNIQUE INDEX "report_filters_generatedReportId_key" ON reporting.report_filters USING btree ("generatedReportId");


--
-- Name: report_filters_productType_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX "report_filters_productType_idx" ON reporting.report_filters USING btree ("productType");


--
-- Name: report_filters_status_idx; Type: INDEX; Schema: reporting; Owner: postgres
--

CREATE INDEX report_filters_status_idx ON reporting.report_filters USING btree (status);


--
-- Name: service_completions_completedAt_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_completions_completedAt_idx" ON service_request.service_completions USING btree ("completedAt");


--
-- Name: service_completions_serviceRequestId_key; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE UNIQUE INDEX "service_completions_serviceRequestId_key" ON service_request.service_completions USING btree ("serviceRequestId");


--
-- Name: service_completions_technicianId_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_completions_technicianId_idx" ON service_request.service_completions USING btree ("technicianId");


--
-- Name: service_notes_createdAt_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_notes_createdAt_idx" ON service_request.service_notes USING btree ("createdAt");


--
-- Name: service_notes_serviceRequestId_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_notes_serviceRequestId_idx" ON service_request.service_notes USING btree ("serviceRequestId");


--
-- Name: service_requests_assetId_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_requests_assetId_idx" ON service_request.service_requests USING btree ("assetId");


--
-- Name: service_requests_createdAt_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_requests_createdAt_idx" ON service_request.service_requests USING btree ("createdAt");


--
-- Name: service_requests_customerId_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "service_requests_customerId_idx" ON service_request.service_requests USING btree ("customerId");


--
-- Name: service_requests_requestNumber_key; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE UNIQUE INDEX "service_requests_requestNumber_key" ON service_request.service_requests USING btree ("requestNumber");


--
-- Name: service_requests_status_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX service_requests_status_idx ON service_request.service_requests USING btree (status);


--
-- Name: service_requests_type_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX service_requests_type_idx ON service_request.service_requests USING btree (type);


--
-- Name: technician_assignments_serviceRequestId_key; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE UNIQUE INDEX "technician_assignments_serviceRequestId_key" ON service_request.technician_assignments USING btree ("serviceRequestId");


--
-- Name: technician_assignments_technicianId_idx; Type: INDEX; Schema: service_request; Owner: postgres
--

CREATE INDEX "technician_assignments_technicianId_idx" ON service_request.technician_assignments USING btree ("technicianId");


--
-- Name: asset_histories asset_histories_assetId_fkey; Type: FK CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_histories
    ADD CONSTRAINT "asset_histories_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES asset.fire_extinguisher_assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asset_service_records asset_service_records_assetId_fkey; Type: FK CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_service_records
    ADD CONSTRAINT "asset_service_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES asset.fire_extinguisher_assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asset_user_assignments asset_user_assignments_asset_id_fkey; Type: FK CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.asset_user_assignments
    ADD CONSTRAINT asset_user_assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES asset.fire_extinguisher_assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_tasks maintenance_tasks_asset_id_fkey; Type: FK CONSTRAINT; Schema: asset; Owner: postgres
--

ALTER TABLE ONLY asset.maintenance_tasks
    ADD CONSTRAINT maintenance_tasks_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES asset.fire_extinguisher_assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_audit_logs auth_audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.auth_audit_logs
    ADD CONSTRAINT auth_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: otps otps_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.otps
    ADD CONSTRAINT otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES auth.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customerId_fkey; Type: FK CONSTRAINT; Schema: customer; Owner: postgres
--

ALTER TABLE ONLY customer.customer_addresses
    ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES customer.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_notes customer_notes_customerId_fkey; Type: FK CONSTRAINT; Schema: customer; Owner: postgres
--

ALTER TABLE ONLY customer.customer_notes
    ADD CONSTRAINT "customer_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES customer.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_logs notification_logs_notificationId_fkey; Type: FK CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.notification_logs
    ADD CONSTRAINT "notification_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES notification.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_templateId_fkey; Type: FK CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.notifications
    ADD CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES notification.notification_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_exports report_exports_generatedReportId_fkey; Type: FK CONSTRAINT; Schema: reporting; Owner: postgres
--

ALTER TABLE ONLY reporting.report_exports
    ADD CONSTRAINT "report_exports_generatedReportId_fkey" FOREIGN KEY ("generatedReportId") REFERENCES reporting.generated_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report_filters report_filters_generatedReportId_fkey; Type: FK CONSTRAINT; Schema: reporting; Owner: postgres
--

ALTER TABLE ONLY reporting.report_filters
    ADD CONSTRAINT "report_filters_generatedReportId_fkey" FOREIGN KEY ("generatedReportId") REFERENCES reporting.generated_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_completions service_completions_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.service_completions
    ADD CONSTRAINT "service_completions_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES service_request.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_notes service_notes_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.service_notes
    ADD CONSTRAINT "service_notes_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES service_request.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: technician_assignments technician_assignments_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: service_request; Owner: postgres
--

ALTER TABLE ONLY service_request.technician_assignments
    ADD CONSTRAINT "technician_assignments_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES service_request.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZksRmq2NI0chab4FnuMelgiU9l0lOzK9RFRktxGrw4OKnBvUpnIjLRfaZU7Efmj

