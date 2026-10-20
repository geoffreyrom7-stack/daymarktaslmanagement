import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  ArrowDownWideNarrow,
  CalendarDays,
  Check,
  CheckCheck,
  CircleHelp,
  ClipboardList,
  Clock3,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import AuthScreen from './components/AuthScreen';
import TaskEditModal from './components/TaskEditModal';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

const filters = [
  { id: 'all', label: 'All tasks', icon: ClipboardList },
  { id: 'active', label: 'In progress', icon: Clock3 },
  { id: 'completed', label: 'Completed', icon: CheckCheck },
  { id: 'high', label: 'High priority', icon: ArrowDownWideNarrow },
];

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, removeTask } = useTasks(user?.uid);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [operationError, setOperationError] = useState('');
  const [busyTaskId, setBusyTaskId] = useState('');
  const [adding, setAdding] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('daymark-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const toggleTheme = () => setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('daymark-theme', theme);
  }, [theme]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !task.isCompleted)
      || (filter === 'completed' && task.isCompleted)
      || (filter === 'high' && task.priority === 'high');
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    return matchesFilter && text.includes(search.trim().toLowerCase());
  }), [tasks, filter, search]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter((task) => !task.isCompleted).length,
    completed: tasks.filter((task) => task.isCompleted).length,
    high: tasks.filter((task) => task.priority === 'high').length,
  }), [tasks]);
  const completedCount = counts.completed;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const greetingName = user?.displayName?.trim().split(/\s+/)[0] || user?.email?.split('@')[0] || 'there';
  const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const handleCreate = async (task) => {
    setAdding(true);
    setOperationError('');
    try { await createTask(task); } finally { setAdding(false); }
  };

  const handleToggle = async (task) => {
    setOperationError('');
    setBusyTaskId(task.id);
    try { await updateTask(task.id, { isCompleted: !task.isCompleted }); }
    catch (error) { setOperationError(error.message); }
    finally { setBusyTaskId(''); }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setOperationError('');
    setBusyTaskId(task.id);
    try { await removeTask(task.id); }
    catch (error) { setOperationError(error.message); }
    finally { setBusyTaskId(''); }
  };

  const handleSave = async (taskId, changes) => {
    setOperationError('');
    setBusyTaskId(taskId);
    try { await updateTask(taskId, changes); }
    catch (error) { setOperationError(error.message); throw error; }
    finally { setBusyTaskId(''); }
  };

  const handleSignOut = async () => {
    setOperationError('');
    try {
      await signOut(auth);
    } catch (error) {
      setOperationError(error.message);
    }
  };

  if (authLoading) return <LoadingScreen />;
  if (!user) return <><AuthScreen theme={theme} onToggleTheme={toggleTheme} />{authError && <p className="auth-listener-error" role="alert">{authError}</p>}</>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand-lockup app-brand" href="/" aria-label="Daymark home"><span className="brand-icon"><ClipboardList size={19} /></span><span>daymark</span></a>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-card"><span className="workspace-avatar">{greetingName.charAt(0).toUpperCase()}</span><span><strong>Personal space</strong><small>{user.email}</small></span><span className="workspace-chevron">⌄</span></div>
        <div className="sidebar-label">YOUR TASKS</div>
        <nav className="filter-nav" aria-label="Task filters">
          {filters.map(({ id, label, icon: Icon }) => (
            <button className={`filter-link ${filter === id ? 'selected' : ''}`} key={id} type="button" onClick={() => setFilter(id)}>
              <Icon size={17} strokeWidth={1.9} /><span>{label}</span><span className="filter-count">{counts[id]}</span>
              {id === 'high' && counts.high > 0 && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div><Sparkles size={16} /><span>A gentle reminder</span></div><p>You don’t have to do it all today. Just the next thing.</p></div>
          <button className="account-button" type="button" onClick={handleSignOut}><span className="user-avatar">{user.photoURL ? <img src={user.photoURL} alt="" /> : greetingName.charAt(0).toUpperCase()}</span><span className="account-copy"><strong>{user.displayName || greetingName}</strong><small>Personal account</small></span><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Personal space</span><span>/</span><strong>My tasks</strong></div>
          <div className="topbar-right"><span className="sync-indicator"><span /> All changes saved</span><span className="topbar-divider" /><button className="help-button theme-toggle" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} aria-pressed={theme === 'dark'} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={toggleTheme}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button><button className="help-button" type="button" aria-label="About Daymark" title="Tasks sync in real time and are private to your account."><CircleHelp size={18} /></button></div>
        </header>

        <div className="dashboard">
          <section className="welcome-section">
            <div>
              <div className="today-date"><CalendarDays size={15} />{todayLabel}</div>
              <h1>Good day, {greetingName}<span className="wave">✳</span></h1>
              <p>One thing at a time. You’re making progress.</p>
            </div>
            <div className="progress-card">
              <div className="progress-title"><span>YOUR DAILY PROGRESS</span><span className="progress-percent">{progress}%</span></div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="progress-caption"><span>{completedCount} of {tasks.length} tasks complete</span><span>{progress === 100 && tasks.length ? 'Nicely done!' : 'Keep it going'}</span></div>
            </div>
          </section>

          <TaskForm onCreate={handleCreate} busy={adding} />

          <section className="task-section">
            <div className="section-heading">
              <div><h2>{filter === 'all' ? 'Your tasks' : filters.find((item) => item.id === filter)?.label}</h2><span className="section-count">{visibleTasks.length}</span></div>
              <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search tasks" placeholder="Search tasks..." />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={14} /></button>}</label>
            </div>

            {(tasksError || operationError) && <div className="error-banner" role="alert">{tasksError || operationError}</div>}

            {tasksLoading ? (
              <div className="task-list" aria-label="Loading tasks">{[1, 2, 3].map((item) => <div className="skeleton-row" key={item}><span className="skeleton circle" /><div><span className="skeleton line" /><span className="skeleton short-line" /></div></div>)}</div>
            ) : visibleTasks.length ? (
              <div className="task-list">
                {visibleTasks.map((task) => <TaskItem key={task.id} task={task} busy={busyTaskId === task.id} onToggle={handleToggle} onEdit={setEditingTask} onDelete={handleDelete} />)}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">{filter === 'completed' ? <CheckCheck size={24} /> : filter === 'high' ? <ArrowDownWideNarrow size={24} /> : <ClipboardList size={24} />}</span>
                <h3>{search ? 'No matching tasks' : emptyTitle(filter, tasks.length)}</h3>
                <p>{search ? 'Try another search, or clear the filter.' : emptyDescription(filter, tasks.length)}</p>
                {filter === 'all' && tasks.length === 0 && <button type="button" className="empty-add-button" onClick={() => document.querySelector('.composer-title-row input')?.focus()}><Plus size={16} /> Add your first task</button>}
              </div>
            )}
          </section>
          <footer className="dashboard-footer"><span>Small steps still move you forward.</span><span>Made for a more intentional day <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>
      {editingTask && <TaskEditModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleSave} busy={busyTaskId === editingTask.id} />}
    </div>
  );
}

function emptyTitle(filter, taskCount) {
  if (filter === 'completed') return 'Nothing completed just yet';
  if (filter === 'active') return 'You’re all caught up';
  if (filter === 'high') return 'No high-priority tasks';
  return taskCount ? 'No tasks in this view' : 'A fresh start';
}

function emptyDescription(filter, taskCount) {
  if (filter === 'completed') return 'Check off a task when you finish it, and it’ll show up here.';
  if (filter === 'active') return 'Every task on your list is complete. Enjoy the breathing room.';
  if (filter === 'high') return 'Tasks marked high priority will be collected here.';
  return taskCount ? 'Choose another filter to see more of your tasks.' : 'Add a task above to get your day moving.';
}

function LoadingScreen() {
  return <main className="loading-screen"><span className="brand-icon"><ClipboardList size={20} /></span><span>Getting your space ready...</span><span className="loading-bar" /></main>;
}
