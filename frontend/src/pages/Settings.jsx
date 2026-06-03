/**
 * @file Settings.jsx
 * System settings: theme preference and (for admins) a button to trigger the
 * notification generation job. Demonstrates the light/dark preference storage.
 */
import { Card, Title, Text, Button } from '@tremor/react';
import { Sun, Moon, Bell, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/ui.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, apiErrorMessage } from '../lib/api.js';

export default function Settings() {
  const { theme, toggle } = useTheme();
  const { hasRole } = useAuth();
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/notifications/generate');
      toast.success(`Generated ${data.data.created} notifications`);
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="System Settings" subtitle="Manage your preferences" />

      <Card>
        <Title>Appearance</Title>
        <Text>Choose between light and dark mode. Your preference is stored locally.</Text>
        <div className="mt-4 flex items-center gap-3">
          <Button icon={theme === 'dark' ? Sun : Moon} variant="secondary" onClick={toggle}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
          <span className="text-sm text-gray-400">Current: {theme}</span>
        </div>
      </Card>

      {hasRole('ADMIN') && (
        <Card className="mt-4">
          <Title>Notifications</Title>
          <Text>Run the notification generator to scan for upcoming/overdue inspections and expiring assets.</Text>
          <div className="mt-4">
            <Button icon={busy ? Loader2 : Bell} disabled={busy} onClick={generate}>Generate Notifications</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
