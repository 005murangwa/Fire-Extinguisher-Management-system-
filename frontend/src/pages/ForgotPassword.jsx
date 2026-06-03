/**
 * @file ForgotPassword.jsx
 * Two-step password reset: request a token by email, then set a new password.
 * In the academic/dev build the reset token is returned by the API and shown
 * to the user (in production it would be emailed).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Flame, Loader2 } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api.js';

export default function ForgotPassword() {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const requestToken = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('If the email exists, a reset token was issued.');
      if (data.data?.resetUrl) {
        window.location.href = data.data.resetUrl;
        return;
      }
      if (data.data?.resetToken) setToken(data.data.resetToken);
      setStep('reset');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Password reset. You can sign in now.');
      setStep('done');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Flame className="h-5 w-5 text-amber-200" />
          </div>
          <span className="text-lg font-bold dark:text-white">TZW FEMS</span>
        </div>

        {step === 'request' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password</h2>
            <p className="mt-1 text-sm text-gray-500">Enter your email to receive a reset token.</p>
            <form onSubmit={requestToken} className="mt-6 space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tzw.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset token
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h2>
            <p className="mt-1 text-sm text-gray-500">Paste your token and choose a new password.</p>
            <form onSubmit={resetPassword} className="mt-6 space-y-4">
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Reset token"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Reset password
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All set!</h2>
            <p className="mt-2 text-sm text-gray-500">Your password has been reset.</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
