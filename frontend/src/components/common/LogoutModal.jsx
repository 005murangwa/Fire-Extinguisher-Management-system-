/**
 * @file LogoutModal.jsx
 * Logout confirmation dialog rendered in a portal so it stays centered on
 * the viewport (not anchored to the top bar / profile dropdown).
 */
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

/**
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {() => void} props.onConfirm - User confirmed logout.
 * @param {() => void} props.onCancel - User dismissed the modal.
 */
export default function LogoutModal({ open, onConfirm, onCancel }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />

          <motion.div
            className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
              <LogOut className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3
              id="logout-modal-title"
              className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Log out?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to log out of TZW FEMS?
            </p>
            <div className="mt-6 flex justify-center gap-3">
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
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
