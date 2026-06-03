/**

 * @file Login.jsx

 * Login page with client-side validation and branded panel.

 */

import { useState } from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import { Flame, Mail, Lock, Loader2, Shield } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

import { apiErrorMessage } from '../lib/api.js';

import { inputCls } from '../components/ui.jsx';



export default function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });

  const [errors, setErrors] = useState({});

  const [busy, setBusy] = useState(false);



  const validate = () => {

    const e = {};

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email address';

    if (!form.password) e.password = 'Password is required';

    setErrors(e);

    return Object.keys(e).length === 0;

  };



  const submit = async (ev) => {

    ev.preventDefault();

    if (!validate()) return;

    setBusy(true);

    try {

      const { isFirstLogin } = await login(form.email, form.password);

      toast.success('Welcome back!');

      if (isFirstLogin) navigate('/first-login', { replace: true });

      else navigate(location.state?.from?.pathname || '/dashboard', { replace: true });

    } catch (err) {

      toast.error(apiErrorMessage(err));

    } finally {

      setBusy(false);

    }

  };



  return (

    <div className="flex min-h-screen">

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-12 text-white lg:flex">

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />

        <div className="relative flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">

            <Flame className="h-6 w-6 text-amber-300" />

          </div>

          <span className="text-xl font-bold tracking-tight">TZW FEMS</span>

        </div>

        <div className="relative">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200">

            <Shield className="h-3.5 w-3.5" /> Enterprise fire safety platform

          </div>

          <h1 className="text-4xl font-bold leading-tight">Fire Extinguisher Management System</h1>

          <p className="mt-4 max-w-md text-slate-300">

            Monitor compliance, schedule inspections, and keep every facility safe from one dashboard.

          </p>

        </div>

        <p className="relative text-sm text-slate-500">© {new Date().getFullYear()} TZW LTD</p>

      </div>



      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 dark:from-gray-950 dark:to-gray-900 lg:w-1/2">

        <motion.div

          initial={{ opacity: 0, y: 16 }}

          animate={{ opacity: 1, y: 0 }}

          className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900"

        >

          <div className="mb-6 flex items-center gap-2 lg:hidden">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">

              <Flame className="h-5 w-5 text-amber-200" />

            </div>

            <span className="text-lg font-bold dark:text-white">TZW FEMS</span>

          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h2>

          <p className="mt-1 text-sm text-gray-500">Access your fire safety dashboard</p>



          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>

            <Field label="Email" error={errors.email} icon={Mail}>

              <input

                type="email"

                value={form.email}

                onChange={(e) => setForm({ ...form, email: e.target.value })}

                className="w-full bg-transparent text-sm outline-none dark:text-white"

                placeholder="you@company.com"

              />

            </Field>

            <Field label="Password" error={errors.password} icon={Lock}>

              <input

                type="password"

                value={form.password}

                onChange={(e) => setForm({ ...form, password: e.target.value })}

                className="w-full bg-transparent text-sm outline-none dark:text-white"

                placeholder="••••••••"

              />

            </Field>



            <div className="flex justify-end">

              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">

                Forgot password?

              </Link>

            </div>



            <button

              type="submit"

              disabled={busy}

              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"

            >

              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in

            </button>

          </form>



          <p className="mt-6 text-center text-sm text-gray-500">

            No account?{' '}

            <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Create one</Link>

          </p>



          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/80 p-3 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">

            <p className="font-semibold">Demo accounts (password: Password123!)</p>

            <p className="mt-1 break-all">brillanteigabemurangwa@gmail.com · inspector@tzw.com · user@tzw.com</p>

          </div>

        </motion.div>

      </div>

    </div>

  );

}



function Field({ label, error, icon: Icon, children }) {

  return (

    <div>

      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${error ? 'border-rose-400' : 'border-gray-300 dark:border-gray-700'}`}>

        <Icon className="h-4 w-4 shrink-0 text-gray-400" />

        {children}

      </div>

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

    </div>

  );

}


