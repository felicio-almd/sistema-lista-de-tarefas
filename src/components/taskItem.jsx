import { useState } from "react";
import { Icon } from "@iconify/react";
import { ref, update } from "firebase/database";
import { db } from "../firebase/firebase";
import { Draggable } from "@hello-pangea/dnd";

export default function TaskItem({ task, index, tasks, setTaskToDelete }) {
    const [editingTask, setEditingTask] = useState(null);
    const [editingTaskName, setEditingTaskName] = useState("");
    const [editingCost, setEditingCost] = useState("");
    const [editingDeadline, setEditingDeadline] = useState("");

    const startEditing = (taskToEdit) => {
        setEditingTask(taskToEdit);
        setEditingTaskName(taskToEdit.name);
        setEditingCost(taskToEdit.cost.toString());
        setEditingDeadline(taskToEdit.deadline);
    };

    const updateTask = async () => {
        if (!editingTaskName.trim()) {
            alert("A tarefa precisa de um nome.");
            return;
        }

        const taskExists = tasks.some(
            (t) => t.name === editingTaskName && t.id !== editingTask.id
        );

        if (taskExists) {
            alert("Essa tarefa já existe.");
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

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${task.cost >= 1000 ? "!bg-accent" : ""} bg-white dark:bg-bgBlack task-item border border-gray-300 px-4 py-1 m-2 rounded`}

                >
                    {editingTask && editingTask.id === task.id ? (
                        <div className="flex gap-2 p-3">
                            <input
                                className="border border-black dark:bg-white dark:text-primary flex-1 rounded border-none px-2 py-2 focus:outline-none 
                                focus:border-secondary focus:ring-2 focus:ring-secondary shadow-md"
                                type="text"
                                placeholder="Nome da tarefa"
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                            />
                            <input
                                className="border border-black flex-1 rounded border-none px-2 py-2 shadow-md dark:bg-white dark:text-primary
                                focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                type="number"
                                placeholder="Custo (R$)"
                                value={editingCost}
                                onChange={(e) => setEditingCost(e.target.value)}
                            />
                            <input
                                className="border border-black flex-1 rounded border-none px-2 py-2 shadow-md dark:bg-white dark:text-black
                                focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary"
                                type="date"
                                placeholder="Data limite"
                                value={editingDeadline}
                                onChange={(e) => setEditingDeadline(e.target.value)}
                            />
                            <button
                                onClick={updateTask}
                                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => setEditingTask(null)}
                                className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-14 h-16 items-center max-lg:h-12 max-lg:py-1">
                            <h3 className="max-lg:text-sm lg:line-clamp-2 flex-1 max-lg:min-w-full max-lg:h-full max-lg:flex max-lg:items-center max-lg:justify-center"><span className="max-lg:line-clamp-2 max-lg:text-center">{task.name}</span></h3>
                            <p className={`${task.cost >= 1000 ? "font-semibold text-yellow-400" : ""} flex-1 max-lg:hidden`}>Custo: R$ {task.cost}</p>
                            <p className="flex-1 max-lg:hidden">Data limite: {new Date(task.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            {/* <p className="flex-1">Ordem de apresentação: {task.order}</p> */}
                            <div className="flex gap-2">
                                <button className={`${task.cost >= 1000 ? "hover:text-black hover:bg-white dark:hover:text-black" : "hover:text-white"} rounded max-lg:hidden p-2 hover:bg-accent duration-200 `} onClick={() => startEditing(task)}><Icon className="text-3xl" icon="material-symbols:edit-square-outline-rounded" /></button>
                                <button className="p-2 hover:bg-red-600 duration-200 rounded hover:text-white max-lg:hidden" onClick={() => setTaskToDelete(task)}><Icon className="text-3xl" icon="material-symbols:delete-outline" /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};
