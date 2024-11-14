'use client'
import { createContext, useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Icon } from "@iconify/react";
import app from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { useTasks } from "../hooks/useTasks";
import Footer from "../components/footer";
import TaskItem from "../components/taskItem";
import Header from "../components/header";
import ThemeToggle from "../components/toggle";

export const ThemeContext = createContext(null);

export default function Dashboard() {
    const { tasks, setTasks, createTask, deleteTask, updateTask } = useTasks();
    const [user, setUser] = useState();
    const [taskName, setTaskName] = useState("");
    const [cost, setCost] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showReorderErrorModal, setShowReorderErrorModal] = useState(false);
    const [showTaskExistsModal, setShowTaskExistsModal] = useState(false);

    const textInput = useRef(null);
    const modalRef = useRef(null);

    const storeTask = async () => {
        const trimmedTaskName = taskName.trimEnd();

        if (!trimmedTaskName || !cost || !deadline) {
            setShowErrorModal(true);
            return;
        }

        const taskExists = tasks.some((t) => t.name === trimmedTaskName);
        if (taskExists) {
            setShowTaskExistsModal(true);
            return;
        }

        const order = tasks.length ? Math.max(...tasks.map(t => t.order)) + 1 : 1;

        const taskInput = {
            name: trimmedTaskName,
            cost: Number(cost),
            deadline,
            order,
        };

        await createTask(taskInput);

        setTaskName("");
        setCost("");
        setDeadline("");
        textInput.current.focus()
    };

    const handleDeleteTask = async () => {
        if (taskToDelete) {
            await deleteTask(taskToDelete.id);
            const remainingTasks = tasks.filter(task => task.id !== taskToDelete.id);
            try {
                const sortedTasks = [...remainingTasks].sort((a, b) => a.order - b.order);

                sortedTasks.forEach(async (task, index) => {
                    const newOrder = index + 1;
                    if (task.order !== newOrder) {
                        await updateTask(task.id, { order: newOrder });
                    }
                });
                textInput.current.focus()
                setTaskToDelete(null);
                return sortedTasks
            } catch (error) {
                setShowReorderErrorModal(true);
            }
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedTasks = Array.from(tasks);
        const [movedTask] = reorderedTasks.splice(result.source.index, 1);
        reorderedTasks.splice(result.destination.index, 0, movedTask);

        reorderedTasks.forEach(async (task, index) => {
            const newOrder = index + 1;
            if (task.order !== newOrder) {
                await updateTask(task.id, { order: newOrder });
            }
        });

        setTasks(reorderedTasks)
        setIsDragging(false);
        textInput.current.focus()
    };

    const onDragStart = () => {
        setIsDragging(true);
    };

    useEffect(() => {
        const auth = getAuth(app);
        auth.onAuthStateChanged((user) => {
            setUser(user ? user : null);
        });
    }, []);

    useEffect(() => {
        textInput.current.focus()
    }, []);

    useEffect(() => {
        if (taskToDelete || showErrorModal || showTaskExistsModal) modalRef.current.focus()
    }, [taskToDelete, showErrorModal, showTaskExistsModal]);

    const dataAtual = new Date();
    const diaAtual = dataAtual.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const horas = dataAtual.getHours();
    let saudacao;
    if (horas < 12) {
        saudacao = `Bom dia ${user?.displayName}!`;
    } else if (horas < 18) {
        saudacao = `Boa tarde ${user?.displayName}!`;
    } else {
        saudacao = `Boa noite ${user?.displayName}!`;
    }

    const signOut = async () => {
        const auth = getAuth(app);
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Sign-out Error:", error);
        }
    };

    return (
        <div className="h-screen justify-between flex flex-col items-center">
            <Header title={saudacao}>
                <div className="h-full flex gap-10">
                    <ThemeToggle />
                    <button
                        onClick={signOut}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all"
                    >
                        <Icon icon="material-symbols:arrow-back-rounded"></Icon>
                    </button>
                </div>
            </Header>
            <main className="max-lg:max-w-xs max-w-screen-xl lg:w-full flex items-center justify-center flex-col px-2">
                <div className="w-full py-6 text-lg">
                    <p>Bem-vindo de volta à sua lista de tarefas</p>
                    <p className="font-semibold">{diaAtual}</p>
                    <p>O que deseja fazer?</p>
                </div>
                <div className="max-lg:flex-col flex w-full border-2 border-primary p-3 bg-white dark:bg-bgBlack lg:space-x-2 rounded-lg justify-between m-1 max-lg:gap-3">
                    <input
                        className="dark:bg-white  dark:text-black flex-1 rounded px-2 py-2 shadow-md" type="text"
                        placeholder="Nome da tarefa"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        ref={textInput}
                    />
                    <input
                        className="flex-1 rounded px-2 py-2 shadow-md dark:bg-white dark:text-black  border-transparent
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        placeholder="Custo (R$)"
                        value={cost}
                        onChange={(e) => {
                            let numbers = e.target.value
                                .replace(/[^0-9.,]/g, '')
                            if (numbers > 1000000000) {
                                numbers = '1000000000'
                            }
                            e.target.value = numbers
                            setCost(e.target.value)
                        }
                        }
                        required
                    />
                    <input
                        className="w-full flex-1 rounded border-transparent px-2 py-2 shadow-md dark:bg-white dark:text-black"
                        type="date"
                        placeholder="Data limite"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                    />
                    <button onClick={storeTask} className="flex-1 dark:bg-white dark:text-black shadow-md hover:text-white hover:bg-accent dark:hover:bg-accent rounded transition-all duration-300 max-lg:py-2">
                        Adicionar Tarefa
                    </button>
                </div>

                <div className="mt-4 w-full">
                    {tasks.length > 0 ? (<DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                        <Droppable droppableId="tasks" type="list" direction="vertical">
                            {(provided) => (
                                <article
                                    className={`${isDragging ? 'border-2 border-blue-200' : 'border-2 border-blue-200/0'} rounded-lg transition-all border-dashed`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {tasks.map((task, index) => (
                                        <TaskItem
                                            key={`${task.id}-${index}`}
                                            index={index}
                                            task={task}
                                            tasks={tasks}
                                            setTaskToDelete={setTaskToDelete}
                                            setShowErrorModal={setShowErrorModal}
                                            setShowTaskExistsModal={setShowTaskExistsModal}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </article>
                            )}
                        </Droppable>
                    </DragDropContext>) : (
                        <p className="text-center opacity-30 pt-8">Você ainda não tem nenhuma tarefa</p>
                    )}

                </div>

                {/* Modals */}
                {taskToDelete && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded shadow-lg text-black">
                            <h2>Confirmar exclusão de Tarefa</h2>
                            <p>Tem certeza que deseja excluir a tarefa {taskToDelete.name}?</p>
                            <div className="flex space-x-2 mt-4">
                                <button ref={modalRef} onClick={handleDeleteTask} className="focus:ring focus:ring-black bg-red-500 text-white px-4 py-2 rounded">
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
                                    className="bg-gray-300 px-4 py-2 rounded focus:ring focus:ring-black"
                                    ref={modalRef}
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
                                    className="bg-gray-300 px-4 py-2 rounded focus:ring focus:ring-black"
                                    ref={modalRef}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}