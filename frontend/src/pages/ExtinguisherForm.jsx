/**

 * @file ExtinguisherForm.jsx

 * Create / edit a fire extinguisher with client-side validation.

 */

import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Card, Button } from '@tremor/react';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

import toast from 'react-hot-toast';

import { PageHeader, FormSelect, inputCls } from '../components/ui.jsx';

import ConfirmDialog from '../components/ConfirmDialog.jsx';

import { api, apiErrorMessage } from '../lib/api.js';

import { SIZE_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from '../lib/options.js';



const EMPTY = { serialNumber: '', location: '', type: 'CO2', size: '5 lbs', installationDate: '', expiryDate: '', status: 'Active' };



export default function ExtinguisherForm() {

  const { id } = useParams();

  const editing = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);

  const [errors, setErrors] = useState({});

  const [busy, setBusy] = useState(false);

  const [dirty, setDirty] = useState(false);

  const [leaveGuard, setLeaveGuard] = useState(false);



  useEffect(() => {

    if (!editing) return;

    (async () => {

      try {

        const { data } = await api.get(`/extinguishers/${id}`);

        const e = data.data;

        setForm({

          serialNumber: e.serialNumber, location: e.location, type: e.type, size: e.size,

          installationDate: e.installationDate?.slice(0, 10), expiryDate: e.expiryDate?.slice(0, 10), status: e.status,

        });

      } catch (err) {

        toast.error(apiErrorMessage(err));

      }

    })();

  }, [id, editing]);



  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };



  const validate = () => {

    const e = {};

    if (!form.serialNumber.trim()) e.serialNumber = 'Serial number is required';

    if (!form.location.trim()) e.location = 'Location is required';

    if (!form.installationDate) e.installationDate = 'Installation date is required';

    if (!form.expiryDate) e.expiryDate = 'Expiry date is required';

    if (form.installationDate && form.expiryDate && form.expiryDate <= form.installationDate) {

      e.expiryDate = 'Expiry date must be after installation date';

    }

    setErrors(e);

    return Object.keys(e).length === 0;

  };



  const submit = async (ev) => {

    ev.preventDefault();

    if (!validate()) return;

    setBusy(true);

    try {

      if (editing) await api.put(`/extinguishers/${id}`, form);

      else await api.post('/extinguishers', form);

      setDirty(false);

      toast.success(editing ? 'Extinguisher updated' : 'Extinguisher registered');

      navigate('/extinguishers');

    } catch (err) {

      toast.error(apiErrorMessage(err));

    } finally {

      setBusy(false);

    }

  };



  const tryLeave = () => (dirty ? setLeaveGuard(true) : navigate('/extinguishers'));



  return (

    <div className="mx-auto max-w-2xl">

      <PageHeader

        title={editing ? 'Edit Extinguisher' : 'Register Extinguisher'}

        subtitle={editing ? 'Update the asset details' : 'Add a new fire extinguisher to the inventory'}

        actions={<Button variant="secondary" icon={ArrowLeft} onClick={tryLeave}>Back</Button>}

      />



      <Card className="overflow-visible">

        <form onSubmit={submit} className="space-y-4" noValidate>

          <Field label="Serial Number" error={errors.serialNumber}>

            <input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} className={inputCls(errors.serialNumber)} placeholder="FE-1001" />

          </Field>

          <Field label="Location" error={errors.location}>

            <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls(errors.location)} placeholder="HQ - Floor 1 Lobby" />

          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <FormSelect label="Type" value={form.type} onChange={(v) => set('type', v)} options={TYPE_OPTIONS} />

            <FormSelect label="Size" value={form.size} onChange={(v) => set('size', v)} options={SIZE_OPTIONS} />

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <Field label="Installation Date" error={errors.installationDate}>

              <input type="date" value={form.installationDate} onChange={(e) => set('installationDate', e.target.value)} className={inputCls(errors.installationDate)} />

            </Field>

            <Field label="Expiry Date" error={errors.expiryDate}>

              <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={inputCls(errors.expiryDate)} />

            </Field>

          </div>

          {editing && (

            <FormSelect label="Status" value={form.status} onChange={(v) => set('status', v)} options={STATUS_OPTIONS} />

          )}



          <div className="flex justify-end gap-3 pt-2">

            <Button type="button" variant="secondary" onClick={tryLeave}>Cancel</Button>

            <Button type="submit" icon={busy ? Loader2 : Save} disabled={busy}>

              {editing ? 'Save Changes' : 'Register'}

            </Button>

          </div>

        </form>

      </Card>



      <ConfirmDialog

        open={leaveGuard}

        title="Leave without saving?"

        message="You have unsaved changes. Leave without saving?"

        confirmText="Leave"

        tone="primary"

        onCancel={() => setLeaveGuard(false)}

        onConfirm={() => navigate('/extinguishers')}

      />

    </div>

  );

}



function Field({ label, error, children }) {

  return (

    <div>

      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      {children}

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

    </div>

  );

}


