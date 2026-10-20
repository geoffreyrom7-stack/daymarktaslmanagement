import { useEffect, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

export default function TaskEditModal({ task, onClose, onSave, busy }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(() => {
    const date = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate ? new Date(task.dueDate) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T23:59:59`) : null,
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <header className="modal-header">
          <div><span className="eyebrow">TASK DETAILS</span><h2 id="edit-title">Edit task</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </header>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="edit-form" onSubmit={submit}>
          <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} autoFocus /></label>
          <label><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={4} placeholder="Add a little more detail..." /></label>
          <div className="edit-form-row">
            <label><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label><span>Due date</span><div className="date-input-wrap"><CalendarDays size={15} /><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div></label>
          </div>
          <footer className="modal-footer">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={!title.trim() || busy}>{busy ? 'Saving...' : 'Save changes'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
