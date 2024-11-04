"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";
import Footer from "../components/footer";
import TaskItem from "../components/taskItem";
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

export default function Welcome() {
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [cost, setCost] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskToDelete, setTaskToDelete] = useState(null);

    const storeTask = async () => {
        if (!taskName.trim() || !cost || !deadline) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const taskExists = tasks.some((t) => t.name === taskName);
        if (taskExists) {
            alert("Uma tarefa com este nome já existe. Escolha outro.");
            return;
        }

        const order = tasks.length ? Math.max(...tasks.map(t => t.order)) + 1 : 1;

        const taskRef = push(ref(db, "tasks"));
        await set(taskRef, {
            id: taskRef.key,
            name: taskName,
            cost: parseFloat(cost),
            deadline: deadline,
            order: order,
        });

        setTaskName("");
        setCost("");
        setDeadline("");
    };

    const reorderTasks = async (remainingTasks) => {
        try {
            const sortedTasks = [...remainingTasks].sort((a, b) => a.order - b.order);

            const updates = {};
            sortedTasks.forEach((task, index) => {
                if (task && task.id) {
                    updates[`tasks/${task.id}/order`] = index + 1;
                }
            });

            await update(ref(db), updates);
        } catch (error) {
            alert("Erro ao reordenar tarefas");
        }
    };

    const deleteTask = async () => {
        if (taskToDelete) {
            const taskRef = ref(db, `tasks/${taskToDelete.id}`);
            await remove(taskRef);

            const remainingTasks = tasks.filter(task => task.id !== taskToDelete.id);
            await reorderTasks(remainingTasks);

            setTaskToDelete(null);
            Alert("Tarefa deletada com sucesso");
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const updatedTasks = Array.from(tasks);

        const [movedTask] = updatedTasks.splice(source.index, 1);
        updatedTasks.splice(destination.index, 0, movedTask);
        const updates = {};

        updatedTasks.forEach((task, index) => {
            if (task && task.id) {
                updates[`tasks/${task.id}/order`] = index + 1;
            }
        });

        setTasks(updatedTasks);

        if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
        }
    };

    useEffect(() => {
        const tasksRef = ref(db, "tasks");
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedTasks = Object.entries(data)
                    .map(([id, task]) => ({
                        id,
                        ...task
                    }))
                    .filter(task => task && task.order)
                    .sort((a, b) => a.order - b.order);
                setTasks(loadedTasks);
            } else {
                setTasks([]);
            }
        });
    }, []);

    return (
        <>
            <main className="w-full h-screen flex items-center justify-center flex-col">
                <h1>Sistema lista de Tarefas</h1>

                <div className="mt-4">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="tasks" type="list" direction="vertical">
                            {(provided) => (
                                <article className="border border-blue-500" ref={provided.innerRef} {...provided.droppableProps}>
                                    {tasks.map((task, index) => (
                                        <TaskItem
                                            key={`${task.id}-${index}`}
                                            index={index}
                                            task={task}
                                            tasks={tasks}
                                            setTaskToDelete={setTaskToDelete}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </article>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                <div className="flex border border-black p-4 space-x-2">
                    <input
                        className="border border-black"
                        type="text"
                        placeholder="Nome da tarefa"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <input
                        className="border border-black"
                        type="number"
                        placeholder="Custo (R$)"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />
                    <input
                        className="border border-black"
                        type="date"
                        placeholder="Data limite"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <button onClick={storeTask}>Adicionar Tarefa</button>
                </div>

                {taskToDelete && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg">
                            <h2>Confirmar exclusão de Tarefa</h2>
                            <p>Tem certeza que deseja excluir a tarefa "{taskToDelete.name}"? </p>
                            <div className="flex space-x-2 mt-4">
                                <button onClick={deleteTask} className="bg-red-500 text-white px-4 py-2 rounded">
                                    Confirmar
                                </button>
                                <button onClick={() => setTaskToDelete(null)} className="bg-gray-300 px-4 py-2 rounded">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}