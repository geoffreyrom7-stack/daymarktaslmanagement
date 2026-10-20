import { useState } from 'react';
import { CalendarDays, ChevronDown, Plus } from 'lucide-react';

export default function TaskForm({ onCreate, busy }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setError('');
    try {
      await onCreate({
        title: cleanTitle,
        description: description.trim(),
        priority,
        ...(dueDate ? { dueDate: new Date(`${dueDate}T23:59:59`) } : {}),
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setExpanded(false);
    } catch (createError) {
      setError(createError.message);
    }
  };

  return (
    <form className={`task-composer ${expanded ? 'is-expanded' : ''}`} onSubmit={submit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="composer-title-row">
        <span className="composer-plus"><Plus size={19} /></span>
        <input
          aria-label="Task title"
          value={title}
          onFocus={() => setExpanded(true)}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          placeholder="What needs to get done?"
          required
        />
        <button className="expand-button" type="button" aria-label={expanded ? 'Collapse task options' : 'Show task options'} onClick={() => setExpanded(!expanded)}>
          <ChevronDown size={18} className={expanded ? 'rotate' : ''} />
        </button>
        {(!expanded || title.trim()) && (
          <button className="composer-submit" type="submit" disabled={!title.trim() || busy}>
            <Plus size={16} /><span>Add task</span>
          </button>
        )}
      </div>
      {expanded && (
        <>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={2} placeholder="Add a note or a little more context..." aria-label="Description" />
          <div className="composer-options">
            <label className="compact-field">
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
            <label className="compact-field due-field">
              <CalendarDays size={15} />
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" />
            </label>
            <button className="primary-button composer-mobile-submit" type="submit" disabled={!title.trim() || busy}>Add task</button>
          </div>
        </>
      )}
    </form>
  );
}
