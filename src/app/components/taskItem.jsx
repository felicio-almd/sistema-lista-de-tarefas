import { useState } from "react";
import { Icon } from "@iconify/react";
import { ref, update } from "firebase/database";
import { db } from "../firebase";
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
                    className={`${task.cost >= 1000 ? "!bg-accent" : ""} task-item bg-white border border-gray-300 p-2 m-2 rounded`}
                >
                    {editingTask && editingTask.id === task.id ? (
                        <div className="flex gap-2">
                            <input
                                className="border border-black px-2 py-1"
                                type="text"
                                placeholder="Nome da tarefa"
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                            />
                            <input
                                className="border border-black px-2 py-1"
                                type="number"
                                placeholder="Custo (R$)"
                                value={editingCost}
                                onChange={(e) => setEditingCost(e.target.value)}
                            />
                            <input
                                className="border border-black px-2 py-1"
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
                        <div className="flex gap-14">
                            <h3 className="flex-1">{task.name}</h3>
                            <p className={`${task.cost >= 1000 ? "font-bold text-red-700" : ""} flex-1`}>Custo: R$ {task.cost}</p>
                            <p className="flex-1">Data limite: {new Date(task.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            <p className="flex-1">Ordem de apresentação: {task.order}</p>
                            <button onClick={() => startEditing(task)}><Icon icon="material-symbols:edit-square-outline-rounded" /></button>
                            <button onClick={() => setTaskToDelete(task)}><Icon icon="material-symbols:delete-outline" /></button>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};
