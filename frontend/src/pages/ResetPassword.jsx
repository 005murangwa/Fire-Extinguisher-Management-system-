/**
 * @file ResetPassword.jsx
 * Password reset via email link (?token=...). Keeps the user signed in after reset.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage, tokenStore } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    if (!token.trim()) {
      toast.error('Reset token is required');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token: token.trim(), newPassword });
      if (data.data?.accessToken) {
        tokenStore.set(data.data);
        if (data.data.user) setUser(data.data.user);
      }
      toast.success('Password updated — you are still signed in');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set a new password using the link from your email.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {!tokenFromUrl && (
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Reset token"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          )}
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset password
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
