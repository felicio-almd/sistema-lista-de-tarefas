import { createContext, useContext, useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, writeBatch, setDoc } from "firebase/firestore";
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
            const tasksQuery = query(userTasksRef, orderBy("order"));
            const querySnapshot = await getDocs(tasksQuery);
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

            const querySnapshot = await getDocs(userTasksRef);
            let maxId = 0;

            querySnapshot.forEach((doc) => {
                const docId = parseInt(doc.id, 10);
                if (!isNaN(docId) && docId > maxId) {
                    maxId = docId;
                }
            });

            const newId = maxId + 1;

            const docRef = doc(userTasksRef, newId.toString());
            await setDoc(docRef, {
                ...taskInput,
                createdAt: new Date().toISOString(),
            });

            const newTask = {
                id: newId,
                ...taskInput,
                createdAt: new Date().toISOString(),
            };

            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Erro criando task:", error);
        }
    }


    async function deleteTask(id) {
        if (!userAuth) return;

        try {
            const taskDocRef = doc(firestore, "users", userAuth.uid, "tasks", id);
            await deleteDoc(taskDocRef);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error("Erro ao deletar task:", error);
        }
    }

    async function updateTask(id, updatedData) {
        if (!userAuth) return;

        try {
            const taskDocRef = doc(firestore, "users", userAuth.uid, "tasks", id);

            const updateData = {
                ...updatedData,
                updatedAt: new Date().toISOString(),
            };

            await updateDoc(taskDocRef, updateData);

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === id
                        ? { ...task, ...updateData }
                        : task
                )
            );
        } catch (error) {
            throw error;
        }
    }

    return (
        <TasksContext.Provider value={{ tasks, createTask, deleteTask, updateTask, setTasks }}>
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