import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  useEffect(() => {
    setTasks([]);
    setError('');
    setLoading(Boolean(userId));
    if (!userId) return undefined;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        setTasks(snapshot.docs.map((taskDoc) => ({ id: taskDoc.id, ...taskDoc.data() })));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );
  }, [userId]);

  const createTask = useCallback(async (task) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('Your session has expired. Sign in again to add tasks.');
    }
    const { dueDate, ...details } = task;
    const taskData = {
      ...details,
      userId: currentUser.uid,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (dueDate) taskData.dueDate = dueDate;
    return addDoc(collection(db, 'tasks'), taskData);
  }, [userId]);

  const updateTask = useCallback(async (taskId, updates) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('Your session has expired. Sign in again to update tasks.');
    }
    const { dueDate, ...details } = updates;
    const taskUpdates = { ...details, updatedAt: serverTimestamp() };
    if (Object.hasOwn(updates, 'dueDate')) {
      if (dueDate) taskUpdates.dueDate = dueDate;
      else taskUpdates.dueDate = deleteField();
    }
    return updateDoc(doc(db, 'tasks', taskId), taskUpdates);
  }, [userId]);

  const removeTask = useCallback(async (taskId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('Your session has expired. Sign in again to delete tasks.');
    }
    return deleteDoc(doc(db, 'tasks', taskId));
  }, [userId]);

  return { tasks, loading, error, createTask, updateTask, removeTask };
}
