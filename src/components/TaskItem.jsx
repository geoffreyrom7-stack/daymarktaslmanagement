import { useState } from 'react';
import { CalendarDays, Check, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default function TaskItem({ task, onToggle, onEdit, onDelete, busy }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && !task.isCompleted && dueDate < new Date(new Date().setHours(0, 0, 0, 0));
  const dueLabel = dueDate?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <article className={`task-row ${task.isCompleted ? 'task-done' : ''}`}>
      <button
        className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
        type="button"
        aria-label={task.isCompleted ? `Mark ${task.title} active` : `Complete ${task.title}`}
        disabled={busy}
        onClick={() => onToggle(task)}
      >
        {task.isCompleted && <Check size={14} strokeWidth={2.8} />}
      </button>
      <div className="task-content">
        <button className="task-title" type="button" onClick={() => onEdit(task)}>{task.title}</button>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`priority-dot ${task.priority || 'medium'}`} />
          <span className={`priority-label ${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
          {dueLabel && <span className={`due-label ${isOverdue ? 'overdue' : ''}`}><CalendarDays size={13} />{isOverdue ? 'Overdue' : dueLabel}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-button edit-action" type="button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={15} /></button>
        <div className="task-menu-wrap">
          <button className="icon-button" type="button" aria-label={`More options for ${task.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={19} /></button>
          {menuOpen && (
            <div className="task-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={14} /> Edit task</button>
              <button type="button" role="menuitem" className="delete-menu-item" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={14} /> Delete task</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
