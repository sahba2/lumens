"use client";

import AuthPanel from "./AuthPanel";
import Modal from "./Modal";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Where a freshly authenticated visitor is sent (defaults to the dashboard). */
  afterAuthHref?: string;
}

/**
 * Login / sign-up dialog opened from the header (and the mobile drawer).
 * Wraps the shared `AuthPanel` form in the base `Modal`, which owns the
 * backdrop, the close button, Esc handling and the scroll lock.
 *
 * The header points `afterAuthHref` at the hero render box, so a visitor who
 * signs in to try the free render lands back on that exact box, and the dialog
 * closes itself as soon as the session is ready.
 */
export default function AuthModal({ open, onClose, afterAuthHref }: AuthModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ورود / ثبت‌نام"
      subtitle="با حساب LUMENS به دوره‌های خریداری‌شده، لایسنس آبجکت‌ها و پرامپت‌های ذخیره‌شده دسترسی دارید."
    >
      <AuthPanel afterAuthHref={afterAuthHref} onAuthenticated={onClose} />
    </Modal>
  );
}
