/**

 * @file Register.jsx

 * Two-step registration: send email OTP, then verify and create account.

 */

import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import { Flame, Loader2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

import { api, apiErrorMessage } from '../lib/api.js';



function passwordIssues(pw) {

  const issues = [];

  if (pw.length < 8) issues.push('At least 8 characters');

  if (!/[a-z]/.test(pw)) issues.push('A lowercase letter');

  if (!/[A-Z]/.test(pw)) issues.push('An uppercase letter');

  if (!/[0-9]/.test(pw)) issues.push('A number');

  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('A special character');

  return issues;

}



export default function Register() {

  const { completeRegistration } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState('form');

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', otp: '' });

  const [errors, setErrors] = useState({});

  const [busy, setBusy] = useState(false);



  const pwIssues = passwordIssues(form.password);



  const validateForm = () => {

    const e = {};

    if (!form.firstName.trim()) e.firstName = 'First name is required';

    if (!form.lastName.trim()) e.lastName = 'Last name is required';

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email address';

    if (pwIssues.length) e.password = 'Password does not meet the policy';

    setErrors(e);

    return Object.keys(e).length === 0;

  };



  const sendOtp = async (ev) => {

    ev.preventDefault();

    if (!validateForm()) return;

    setBusy(true);

    try {

      await api.post('/auth/send-registration-otp', {

        firstName: form.firstName,

        lastName: form.lastName,

        email: form.email,

        password: form.password,

      });

      toast.success('Verification code sent to your email');

      setStep('otp');

    } catch (err) {

      toast.error(apiErrorMessage(err));

    } finally {

      setBusy(false);

    }

  };



  const verifyAndRegister = async (ev) => {

    ev.preventDefault();

    if (!form.otp || form.otp.length !== 6) {

      setErrors({ otp: 'Enter the 6-digit code from your email' });

      return;

    }

    setBusy(true);

    try {

      await completeRegistration(form);

      toast.success('Account created! Please sign in.');

      navigate('/login', { replace: true });

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

        className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900"

      >

        <div className="mb-6 flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">

            <Flame className="h-5 w-5 text-amber-200" />

          </div>

          <span className="text-lg font-bold dark:text-white">TZW FEMS</span>

        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>

        <p className="mt-1 text-sm text-gray-500">

          {step === 'form' ? 'We will email you a verification code' : 'Enter the code sent to your email'}

        </p>



        {step === 'form' ? (

          <form onSubmit={sendOtp} className="mt-6 space-y-4" noValidate>

            <div className="grid grid-cols-2 gap-4">

              <Input label="First name" value={form.firstName} error={errors.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />

              <Input label="Last name" value={form.lastName} error={errors.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />

            </div>

            <Input label="Email" type="email" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" />

            <Input label="Password" type="password" value={form.password} error={errors.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" />

            {form.password && pwIssues.length > 0 && (

              <ul className="space-y-0.5 text-xs text-gray-500">

                {pwIssues.map((i) => <li key={i}>• Needs: {i}</li>)}

              </ul>

            )}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">

              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send verification code

            </button>

          </form>

        ) : (

          <form onSubmit={verifyAndRegister} className="mt-6 space-y-4" noValidate>

            <Input label="Verification code" value={form.otp} error={errors.otp} onChange={(v) => setForm({ ...form, otp: v.replace(/\D/g, '').slice(0, 6) })} placeholder="123456" />

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">

              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify & create account

            </button>

            <button type="button" className="w-full text-sm text-indigo-600 hover:underline" onClick={() => setStep('form')}>Back</button>

          </form>

        )}



        <p className="mt-6 text-center text-sm text-gray-500">

          Already registered? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>

        </p>

      </motion.div>

    </div>

  );

}



function Input({ label, value, onChange, error, type = 'text', placeholder }) {

  return (

    <div>

      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      <input

        type={type}

        value={value}

        placeholder={placeholder}

        onChange={(e) => onChange(e.target.value)}

        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none dark:bg-gray-800 dark:text-white ${error ? 'border-rose-400' : 'border-gray-300 dark:border-gray-700'}`}

      />

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

    </div>

  );

}


