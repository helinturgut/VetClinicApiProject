export default function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      {icon && <span className="empty-state-icon">{icon}</span>}
      {message}
    </div>
  );
}
