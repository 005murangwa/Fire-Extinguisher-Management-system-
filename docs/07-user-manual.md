# User Manual

## 1. Roles

| Role | Capabilities |
| ---- | ------------ |
| **ADMIN** | Manage users & settings, view all reports, manage all records, view audit logs, generate notifications |
| **INSPECTOR** | Conduct inspections, schedule maintenance, log maintenance, register/update extinguishers, view assigned inspections |
| **USER** | View extinguisher status, schedule inspections, view inspection history |

The navigation menu and available actions adapt automatically to your role.

## 2. Getting started

1. Open the app at `http://localhost:5173`.
2. **Sign in** with your email and password, or **Register** a new account
   (created with the USER role).
3. Forgot your password? Use **Forgot password** to obtain a reset token and set
   a new one.

## 3. Pages

### Dashboard
The landing page shows real-time KPIs (total/active/expired extinguishers,
pending/overdue inspections, maintenance due, compliance %), analytics charts
(distribution by type/location, registration trend, inspection trend), a
compliance panel, the most-maintained equipment, and a recent activity feed.
**Quick action** buttons jump to common tasks.

### Fire Extinguishers
- Browse, search and filter (by type/status) the asset inventory.
- **Register Extinguisher** (ADMIN/INSPECTOR): enter serial, location, type,
  size and dates. The form validates that expiry is after installation.
- Click a row's **eye** icon to open **Details**, which shows the asset's full
  inspection + maintenance **timeline**.
- Edit (ADMIN/INSPECTOR) and Delete (ADMIN). Delete asks for confirmation.

### Inspections
- **Schedule Inspection**: pick an extinguisher, a future date and time. Past
  dates and duplicate slots are rejected.
- INSPECTOR/ADMIN can **Complete** an inspection (records a result) or **Cancel**
  it (with confirmation).

### Maintenance
- View the full maintenance history (searchable, exportable).
- **Log Maintenance** (ADMIN/INSPECTOR): record the action taken, issues,
  notes and recommendations.

### Reports
Four tabs — Inventory, Inspections, Compliance, Maintenance — each with charts
and **Export to CSV / PDF** buttons that download a server-generated report.

### Notification Center
Lists upcoming/overdue inspections, expiring extinguishers and maintenance
reminders. Filter by type, **Mark read** individually or **Mark all read**. The
top-bar bell shows an unread counter.

### User Management (ADMIN)
Create, edit (role/status) and delete users. Deletion requires confirmation; you
cannot delete your own account.

### Audit Logs (ADMIN)
A searchable, exportable trail of security-relevant actions (logins,
registrations, record changes, report exports) with actor, action, entity and
timestamp.

### Profile Settings
Update your name/email and change your password (subject to the strong-password
policy).

### System Settings
Toggle **light/dark mode** (saved locally). Admins can trigger notification
generation.

## 4. Confirmations (safety)

Destructive or risky actions always ask for confirmation, e.g.:
- Logout — "Are you sure you want to logout?"
- Delete extinguisher — "Are you sure you want to delete this fire extinguisher?"
- Delete user — "Are you sure you want to delete this user?"
- Cancel inspection — "Are you sure you want to cancel this inspection?"
- Leaving a form with unsaved changes — "You have unsaved changes. Leave without saving?"

## 5. Tips

- Use the **global search** in the top bar to quickly find extinguishers,
  inspections or (for admins) users.
- Tables support sorting, in-table search, pagination and CSV/PDF export.
- Validation messages appear inline beneath each field and as toast messages.
