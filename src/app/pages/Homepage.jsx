"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";
import Footer from "../components/footer";

export default function Welcome() {
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [cost, setCost] = useState("");
    const [deadline, setDeadline] = useState("");
    const [taskToDelete, setTaskToDelete] = useState(null);
    
    const [editingTask, setEditingTask] = useState(null);
    const [editingTaskName, setEditingTaskName] = useState("");
    const [editingCost, setEditingCost] = useState("");
    const [editingDeadline, setEditingDeadline] = useState("");

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

        // nova tarefa pega o custo da anterior + 1
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

    const startEditing = (task) => {
        setEditingTask(task);
        setEditingTaskName(task.name);
        setEditingCost(task.cost);
        setEditingDeadline(task.deadline);
    };

    const updateTask = async () => {
        if (!editingTaskName.trim()) {
            alert("Nome da tarefa não pode estar vazio");
            return;
        }

        const taskExists = tasks.some((t) => t.name === editingTaskName && t.id !== editingTask.id);
        if (taskExists) {
            alert("O nome da tarefa já existe. Escolha outro.");
            return;
        }

        const taskRef = ref(db, `tasks/${editingTask.id}`);
        await update(taskRef, {
            name: editingTaskName,
            cost: parseFloat(editingCost),
            deadline: editingDeadline,
            order: editingTask.order,
        });

        setEditingTask(null);
        setEditingTaskName("");
        setEditingCost("");
        setEditingDeadline("");
    };

    const confirmDelete = (task) => {
        setTaskToDelete(task);
    };

    const deleteTask = async () => {
        if (taskToDelete) {
            const taskRef = ref(db, `tasks/${taskToDelete.id}`);
            await remove(taskRef);
            setTaskToDelete(null);
            console.log("Tarefa deletada com sucesso!");
        }
    };

    useEffect(() => {
        const tasksRef = ref(db, "tasks");
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedTasks = Object.values(data).sort((a, b) => a.order - b.order); // Ordena pela ordem de apresentação
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

                {/* Lista de tarefas */}
                <div className="mt-4">
                    {tasks.map((task) => (
                        <div key={task.id} className={`${task.cost >= 1000 ? "bg-teal-600" : ""} task-item border border-gray-300 p-2 m-2 rounded`}>
                            {editingTask && editingTask.id === task.id ? (
                                <div>
                                    <input
                                        className="border border-black"
                                        type="text"
                                        placeholder="Nome da tarefa"
                                        value={editingTaskName}
                                        onChange={(e) => setEditingTaskName(e.target.value)}
                                    />
                                    <input
                                        className="border border-black"
                                        type="number"
                                        placeholder="Custo (R$)"
                                        value={editingCost}
                                        onChange={(e) => setEditingCost(e.target.value)}
                                    />
                                    <input
                                        className="border border-black"
                                        type="date"
                                        placeholder="Data limite"
                                        value={editingDeadline}
                                        onChange={(e) => setEditingDeadline(e.target.value)}
                                    />
                                    <button onClick={updateTask}>Salvar Alterações</button>
                                </div>
                            ) : (
                                <div className="flex gap-14">
                                    <h3>{task.name}</h3>
                                    <p className={`${task.cost >= 1000 ? "font-bold text-red-700" : ""}`}>Custo: R$ {task.cost}</p>
                                    <p>Data limite: {task.deadline}</p>
                                    <p>Ordem de apresentação: {task.order}</p>
                                    <button onClick={() => startEditing(task)}>Editar</button>
                                    <button onClick={() => confirmDelete(task)}>Deletar</button>
                                </div>
                            )}
                        </div>
                    ))}
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
