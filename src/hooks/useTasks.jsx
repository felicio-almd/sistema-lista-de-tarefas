import { createContext, useContext, useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { useAuthContext } from "../context/AuthContext";

const TasksContext = createContext({})

export function TasksProvider({ children }) {
    const { userAuth } = useAuthContext();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!userAuth) return;

            const userTasksRef = collection(firestore, "users", userAuth.uid, "tasks");
            const querySnapshot = await getDocs(userTasksRef);
            const loadedTasks = [];
            querySnapshot.forEach((doc) => {
                loadedTasks.push({ id: doc.id, ...doc.data() });
            });
            setTasks(loadedTasks);
        };

        fetchTasks();
    }, [userAuth]);

    async function createTask(taskInput) {
        if (!userAuth) return;

        try {
            const userTasksRef = collection(firestore, "users", userAuth.uid, "tasks");
            const docRef = await addDoc(userTasksRef, {
                ...taskInput,
                createdAt: new Date().toISOString(),
            });
            const newTask = {
                id: docRef.id,
                ...taskInput,
                createdAt: new Date().toISOString(),
            };
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    }

    async function deleteTask(id) {
        if (!userAuth) return;

        try {
            const taskDocRef = doc(firestore, "users", userAuth.uid, "tasks", id);
            await deleteDoc(taskDocRef);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    return (
        <TasksContext.Provider value={{ tasks, createTask, deleteTask }}>
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks precisa ser usado dentro do contexto TasksProvider");
    }
    return context;
}