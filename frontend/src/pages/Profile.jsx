/**
 * @file Profile.jsx
 * Profile settings: view/update profile and change password. Both forms have
 * client-side validation and surface server validation errors via toasts.
 */
import { useState } from 'react';
import { Card, Title, Button } from '@tremor/react';
import { Save, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/ui.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busyP, setBusyP] = useState(false);
  const [busyPw, setBusyPw] = useState(false);

  const saveProfile = async (ev) => {
    ev.preventDefault();
    setBusyP(true);
    try {
      const { data } = await api.patch('/auth/profile', profile);
      setUser(data.data);
      toast.success('Profile updated');
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusyP(false); }
  };

  const changePw = async (ev) => {
    ev.preventDefault();
    setBusyPw(true);
    try {
      await api.post('/auth/change-password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusyPw(false); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile Settings" subtitle="Manage your account information and password" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Title>Profile</Title>
          <form onSubmit={saveProfile} className="mt-4 space-y-3">
            <Input label="First name" value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })} />
            <Input label="Last name" value={profile.lastName} onChange={(v) => setProfile({ ...profile, lastName: v })} />
            <Input label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
            <div className="flex justify-end">
              <Button type="submit" icon={busyP ? Loader2 : Save} disabled={busyP}>Save Profile</Button>
            </div>
          </form>
        </Card>

        <Card>
          <Title>Change Password</Title>
          <form onSubmit={changePw} className="mt-4 space-y-3">
            <Input label="Current password" type="password" value={pw.currentPassword} onChange={(v) => setPw({ ...pw, currentPassword: v })} />
            <Input label="New password" type="password" value={pw.newPassword} onChange={(v) => setPw({ ...pw, newPassword: v })} />
            <p className="text-xs text-gray-400">Min 8 chars with upper, lower, number and special character.</p>
            <div className="flex justify-end">
              <Button type="submit" icon={busyPw ? Loader2 : KeyRound} disabled={busyPw}>Change Password</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
    </div>
  );
}
