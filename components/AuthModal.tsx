"use client";

import AuthPanel from "./AuthPanel";
import Modal from "./Modal";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Login / sign-up dialog opened from the header (and the mobile drawer).
 * Wraps the shared `AuthPanel` form in the base `Modal`, which owns the
 * backdrop, the close button, Esc handling and the scroll lock.
 */
export default function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ورود / ثبت‌نام"
      subtitle="با حساب LUMENS به دوره‌های خریداری‌شده، لایسنس آبجکت‌ها و پرامپت‌های ذخیره‌شده دسترسی دارید."
    >
      <AuthPanel />
    </Modal>
  );
}
