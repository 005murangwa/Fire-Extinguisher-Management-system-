/**
 * @file seed.js
 *
 * Purpose:
 *   Populate the database with realistic sample data so the dashboards,
 *   reports and analytics look like a live enterprise system during the
 *   project demonstration.
 *
 * Seeded data:
 *   - 3 representative users (admin, inspector, standard user) + extras
 *   - ~40 fire extinguishers across types/locations/statuses
 *   - Inspections (scheduled / completed / overdue)
 *   - Maintenance logs, notifications and audit entries
 *
 * Default password for every seeded account: Password123!
 *
 * Usage:
 *   npm run db:seed
 */

import { query, withTransaction, closePool } from '@fems/shared/db.js';
import { hashPassword } from '@fems/shared/password.js';
import { EXTINGUISHER_TYPES, EXTINGUISHER_SIZES } from '@fems/shared/constants.js';

const DEFAULT_PASSWORD = 'Password123!';

const LOCATIONS = [
  'HQ - Floor 1 Lobby', 'HQ - Floor 2 Corridor', 'HQ - Floor 3 Server Room',
  'Warehouse A - Bay 1', 'Warehouse A - Bay 2', 'Warehouse B - Loading Dock',
  'Plaza Mall - East Wing', 'Plaza Mall - Food Court', 'Plaza Mall - Parking L2',
  'Tower One - Reception', 'Tower One - Floor 12', 'Tower One - Roof Plant',
];

/**
 * Pick a pseudo-random element from an array.
 * @template T
 * @param {T[]} arr - Source array.
 * @returns {T} A random element.
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Add days to a date and return an ISO date string (YYYY-MM-DD).
 * @param {Date} base - Base date.
 * @param {number} days - Days to add (can be negative).
 * @returns {string} ISO date string.
 */
const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

async function seed() {
  console.log('Seeding database...');
  const pwHash = await hashPassword(DEFAULT_PASSWORD);

  await withTransaction(async (client) => {
    // Clear existing transactional data (keep roles). Order respects FKs.
    await client.query(
      `TRUNCATE audit_logs, notifications, maintenance_logs, inspections,
                fire_extinguishers, refresh_tokens, users RESTART IDENTITY CASCADE`
    );

    // --- Users ---
    const users = [
      ['Brillante', 'Murangwa', 'brillanteigabemurangwa@gmail.com', 1],
      ['Ian', 'Inspector', 'inspector@tzw.com', 2],
      ['Uma', 'User', 'user@tzw.com', 3],
      ['Grace', 'Hopper', 'grace@tzw.com', 2],
      ['Linus', 'Torvalds', 'linus@tzw.com', 3],
    ];
    const userIds = {};
    for (const [first, last, email, roleId] of users) {
      const { rows } = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role_id)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [first, last, email, pwHash, roleId]
      );
      userIds[email] = rows[0].id;
    }
    const adminId = userIds['brillanteigabemurangwa@gmail.com'];
    const inspectorIds = [userIds['inspector@tzw.com'], userIds['grace@tzw.com']];

    // --- Fire extinguishers ---
    const today = new Date();
    const extinguisherIds = [];
    for (let i = 1; i <= 40; i += 1) {
      const installOffset = -Math.floor(Math.random() * 1500) - 30;
      const installDate = addDays(today, installOffset);
      // Some expire in the past (Expired), some soon, most in the future.
      const lifespanDays = 365 * (1 + Math.floor(Math.random() * 5));
      const expiryDate = addDays(new Date(installDate), lifespanDays);
      const expired = new Date(expiryDate) < today;
      const status = expired ? 'Expired' : pick(['Active', 'Active', 'Active', 'Maintenance']);

      const { rows } = await client.query(
        `INSERT INTO fire_extinguishers
           (serial_number, location, type, size, installation_date, expiry_date, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [
          `FE-${String(1000 + i)}`,
          pick(LOCATIONS),
          pick(EXTINGUISHER_TYPES),
          pick(EXTINGUISHER_SIZES),
          installDate,
          expiryDate,
          status,
          adminId,
        ]
      );
      extinguisherIds.push(rows[0].id);
    }

    const standardUserId = userIds['user@tzw.com'];
    for (let j = 0; j < 3; j += 1) {
      await client.query(
        `UPDATE fire_extinguishers SET assigned_to = $1, assigned_at = now(), assigned_by = $2 WHERE id = $3`,
        [standardUserId, adminId, extinguisherIds[j]]
      );
    }

    // --- Inspections (mix of scheduled, completed, overdue) ---
    const inspectionIds = [];
    for (let i = 0; i < 30; i += 1) {
      const extId = pick(extinguisherIds);
      const inspectorId = pick(inspectorIds);
      const r = Math.random();
      let dateOffset;
      let status;
      let result = null;
      let completedAt = null;
      if (r < 0.4) {
        // Completed in the past
        dateOffset = -Math.floor(Math.random() * 60) - 1;
        status = 'Completed';
        result = pick(['Pass', 'Pass', 'Needs Maintenance', 'Fail']);
        completedAt = new Date(addDays(today, dateOffset)).toISOString();
      } else if (r < 0.7) {
        // Scheduled in the future
        dateOffset = Math.floor(Math.random() * 45) + 1;
        status = 'Scheduled';
      } else {
        // Overdue (scheduled in the past, not completed)
        dateOffset = -Math.floor(Math.random() * 30) - 1;
        status = 'Overdue';
      }
      const { rows } = await client.query(
        `INSERT INTO inspections
           (extinguisher_id, inspector_id, scheduled_by, inspection_date, inspection_time,
            status, result, completed_at, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (extinguisher_id, inspection_date, inspection_time) DO NOTHING
         RETURNING id`,
        [
          extId,
          inspectorId,
          adminId,
          addDays(today, dateOffset),
          `${String(8 + (i % 9)).padStart(2, '0')}:00:00`,
          status,
          result,
          completedAt,
          status === 'Completed' ? 'Routine periodic inspection completed.' : null,
        ]
      );
      if (rows[0]) inspectionIds.push({ id: rows[0].id, extId, inspectorId });
    }

    // --- Maintenance logs ---
    const actions = ['Pressure refill', 'Hose replacement', 'Valve repair', 'Full recharge', 'Tag update'];
    for (let i = 0; i < 20; i += 1) {
      const insp = pick(inspectionIds.length ? inspectionIds : [{ id: null, extId: pick(extinguisherIds), inspectorId: pick(inspectorIds) }]);
      await client.query(
        `INSERT INTO maintenance_logs
           (extinguisher_id, inspection_id, performed_by, action_taken, maintenance_date,
            issues_identified, notes, recommendations)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          insp.extId,
          insp.id,
          insp.inspectorId,
          pick(actions),
          addDays(today, -Math.floor(Math.random() * 90)),
          pick(['Low pressure', 'Corrosion on body', 'None', 'Damaged hose']),
          'Maintenance performed during routine service.',
          pick(['Re-inspect in 6 months', 'No action required', 'Replace within 30 days']),
        ]
      );
    }

    // --- Notifications ---
    const notifTypes = [
      ['INSPECTION_UPCOMING', 'Upcoming inspection', 'An inspection is scheduled soon.'],
      ['INSPECTION_OVERDUE', 'Overdue inspection', 'An inspection is overdue and needs attention.'],
      ['EXTINGUISHER_EXPIRING', 'Extinguisher expiring', 'An extinguisher is approaching its expiry date.'],
      ['MAINTENANCE_REMINDER', 'Maintenance reminder', 'Scheduled maintenance is due.'],
    ];
    for (let i = 0; i < 15; i += 1) {
      const [type, title, message] = pick(notifTypes);
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, entity, entity_id, is_read)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [pick(inspectorIds), type, title, message, 'Extinguisher', pick(extinguisherIds), Math.random() < 0.4]
      );
    }

    // --- Audit logs ---
    for (let i = 0; i < 25; i += 1) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, ip_address)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          adminId,
          pick(['LOGIN', 'EXTINGUISHER_CREATE', 'INSPECTION_SCHEDULE', 'MAINTENANCE_LOG', 'REPORT_EXPORT']),
          'System',
          pick(extinguisherIds),
          JSON.stringify({ seeded: true }),
          '127.0.0.1',
        ]
      );
    }
  });

  console.log('Seed complete.');
  console.log('Login with any of:');
  console.log('  brillanteigabemurangwa@gmail.com / Password123!  (ADMIN)');
  console.log('  inspector@tzw.com / Password123!  (INSPECTOR)');
  console.log('  user@tzw.com / Password123!  (USER)');
}

seed()
  .then(() => closePool())
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await closePool();
    process.exit(1);
  });
