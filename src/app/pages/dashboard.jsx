"use client"
import { createContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";
import Footer from "../components/footer";
import TaskItem from "../components/taskItem";
import Header from "../components/header";
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import ThemeToggle from "../components/toggle";

export const ThemeContext = createContext(null);

export default function Welcome() {
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [cost, setCost] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showReorderErrorModal, setShowReorderErrorModal] = useState(false);
    const [showTaskExistsModal, setShowTaskExistsModal] = useState(false);

    const storeTask = async () => {
        if (!taskName.trim() || !cost || !deadline) {
            setShowErrorModal(true);
            return;
        }

        const taskExists = tasks.some((t) => t.name === taskName);
        if (taskExists) {
            setShowTaskExistsModal(true)
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
        setCost(0);
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
            setShowReorderErrorModal(true);
        }
    };

    const deleteTask = async () => {
        if (taskToDelete) {
            const taskRef = ref(db, `tasks/${taskToDelete.id}`);
            await remove(taskRef);

            const remainingTasks = tasks.filter(task => task.id !== taskToDelete.id);
            await reorderTasks(remainingTasks);

            setTaskToDelete(null);
        }
    };

    const onDragStart = () => {
        setIsDragging(true)
    }

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
        setIsDragging(false);
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

    const dataAtual = new Date();
    const diaAtual = dataAtual.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const horas = dataAtual.getHours();
    let saudacao;
    if (horas < 12) {
        saudacao = 'Bom dia!';
    } else if (horas < 18) {
        saudacao = 'Boa tarde!';
    } else {
        saudacao = 'Boa noite!';
    }

    return (
        <div className="h-screen flex flex-col justify-between items-center">
            <Header title={saudacao}>
                <ThemeToggle />
            </Header>
            <main className="max-lg:max-w-xs max-w-screen-xl lg:w-full flex items-center justify-center flex-col px-2">
                <div className="w-full py-6 text-lg">
                    <p>Bem-vindo de volta à sua lista de tarefas</p>
                    <p className="font-semibold">{diaAtual}</p>
                    <p>O que deseja fazer?</p>
                </div>
                <div className="max-lg:flex-col flex w-full border-2 border-primary p-3 bg-white lg:space-x-2 rounded-lg justify-between m-1 max-lg:gap-3">
                    <input
                        className="border border-black dark:bg-white dark:text-primary flex-1 rounded border-none px-2 py-2 focus:outline-none 
                        focus:border-secondary focus:ring-2 focus:ring-secondary shadow-md"
                        type="text"
                        placeholder="Nome da tarefa"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <input
                        onBlur={(e) => (e.target.value < 0 ? setCost(0) : cost)}
                        min={0}
                        className="border border-black flex-1 rounded border-none px-2 py-2 shadow-md dark:bg-white dark:text-primary
                        focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        placeholder="Custo (R$)"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />
                    <input
                        className="border border-black flex-1 rounded border-none px-2 py-2 shadow-md dark:bg-white dark:text-black
                        focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary"
                        type="date"
                        placeholder="Data limite"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <button onClick={storeTask} className="flex-1 dark:bg-white dark:text-black shadow-md hover:text-white hover:bg-accent rounded transition-all duration-300 max-lg:py-2">Adicionar Tarefa</button>
                </div>

                <div className="mt-4 w-full ">
                    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                        <Droppable droppableId="tasks" type="list" direction="vertical">
                            {(provided) => (
                                <article className={`${isDragging ? 'border-2  border-blue-200' : 'border-2 border-blue-200/0'} rounded-lg transition-all border-dashed`} ref={provided.innerRef} {...provided.droppableProps}>
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

                {/* Area dos modals */}

                {taskToDelete && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg text-black">
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

                {showErrorModal && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg text-black">
                            <h2>Erro ao criar tarefa</h2>
                            <p>Preencha todos os campos obrigatórios antes de continuar.</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowErrorModal(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showReorderErrorModal && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg text-black">
                            <h2>Erro</h2>
                            <p>Erro ao reordenar tarefas.</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowReorderErrorModal(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showTaskExistsModal && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg text-black">
                            <h2>Tarefa já existe</h2>
                            <p>Uma tarefa com esse nome já foi criada. Por favor, escolha um nome diferente.</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowTaskExistsModal(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main >
            <Footer />
        </div>
    );
}