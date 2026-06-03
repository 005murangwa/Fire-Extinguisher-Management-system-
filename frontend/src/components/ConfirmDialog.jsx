/**
 * @file ConfirmDialog.jsx
 * Reusable confirmation modal for destructive actions (delete, logout, cancel,
 * leave-with-unsaved-changes). Animated with Framer Motion.
 *
 * Props:
 *   open        - whether the dialog is visible
 *   title       - heading text
 *   message     - body prompt
 *   confirmText - confirm button label (default "Confirm")
 *   tone        - 'danger' | 'primary' (button colour)
 *   onConfirm   - called when confirmed
 *   onCancel    - called when dismissed
 */
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  tone = 'danger',
  centered = false,
  onConfirm,
  onCancel,
}) {
  const confirmClasses =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700'
      : 'bg-blue-600 hover:bg-blue-700';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
          {/* Panel */}
          <motion.div
            className={`relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900 ${centered ? 'text-center' : ''}`}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className={centered ? 'flex flex-col items-center gap-3' : 'flex items-start gap-4'}>
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900/40">
                <AlertTriangle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className={centered ? '' : 'flex-1'}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {message && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
              </div>
            </div>
            <div className={`mt-6 flex gap-3 ${centered ? 'justify-center' : 'justify-end'}`}>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${confirmClasses}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
