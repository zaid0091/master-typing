import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className={`toast show`} style={{ borderLeftColor: toast.isSuccess ? 'var(--correct-color)' : 'var(--wrong-color)' }}>
      <span className="toast-icon">{toast.isSuccess ? '✅' : '❌'}</span>
      <span>{toast.message}</span>
    </div>
  );
}
