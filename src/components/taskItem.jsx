import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Draggable } from "@hello-pangea/dnd";
import { useTasks } from "../hooks/useTasks";

export default function TaskItem({ task, index, tasks, setTaskToDelete, setShowErrorModal, setShowTaskExistsModal }) {
    const [editingTask, setEditingTask] = useState(null);
    const [editingTaskName, setEditingTaskName] = useState("");
    const [editingCost, setEditingCost] = useState("");
    const [editingDeadline, setEditingDeadline] = useState("");

    const { updateTask } = useTasks();

    const textInput = useRef(null)

    const startEditing = (taskToEdit) => {
        setEditingTask(taskToEdit);
        setEditingTaskName(taskToEdit.name);
        setEditingCost(taskToEdit.cost.toString());
        setEditingDeadline(taskToEdit.deadline);
    };

    const updateInputTask = async () => {
        const trimmedTaskName = editingTaskName.trimEnd();

        if (!trimmedTaskName || !editingCost) {
            setShowErrorModal(true);
            return;
        }

        const taskExists = tasks.some((t) => t.name === trimmedTaskName && t.id !== editingTask.id);
        if (taskExists) {
            setShowTaskExistsModal(true);
            return;
        }

        if (taskExists) {
            setShowTaskExistsModal(true);
            return;
        }

        const taskInput = {
            id: editingTask.id,
            name: trimmedTaskName,
            cost: editingCost,
            deadline: editingDeadline,
            order: task.order,
        };

        await updateTask(editingTask.id, taskInput);

        setEditingTask(null);
        setEditingTaskName("");
        setEditingCost("");
        setEditingDeadline("");
    };

    function formatCost(value) {
        if (!value) return ''
        return (
            new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(value)
        )
    }

    useEffect(() => {
        if (editingTask) textInput.current.focus()
    }, [editingTask])


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
                                className="border border-black xl:flex-1 lg:w-[30%] rounded px-2 py-2 shadow-md dark:bg-white dark:text-black"
                                type="text"
                                placeholder="Nome da tarefa"
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                                required
                                ref={textInput}
                            />
                            <input
                                className="border border-black xl:flex-1 lg:w-[30%] rounded  px-2 py-2 shadow-md dark:bg-white dark:text-black
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                type="text"
                                maxLength={20}
                                placeholder="Custo (R$)"
                                value={editingCost}
                                onChange={(e) => {
                                    let numbers = e.target.value
                                        .replace(/[^0-9.,]/g, '')
                                    e.target.value = numbers
                                    setEditingCost(e.target.value)
                                }
                                }
                                required
                            />
                            <input
                                className="border border-black xl:flex-1 lg:w-[30%] rounded  px-2 py-2 shadow-md dark:bg-white dark:text-black
                                "
                                type="date"
                                placeholder="Data limite"
                                value={editingDeadline}
                                onChange={(e) => setEditingDeadline(e.target.value)}
                                required
                            />
                            <button
                                onClick={updateInputTask}
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
                        <div className="flex max-lg:flex-col lg:gap-14 h-16 items-center max-lg:h-32 max-lg:py-1">
                            <p className="flex-2 max-lg:hidden max-lg:text-sm">{task.id}</p>
                            <h3 className="max-lg:text-sm lg:line-clamp-2 flex-1 max-lg:min-w-full max-lg:h-full max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-2"><span className="max-lg:line-clamp-2 max-lg:text-center">{task.name}</span></h3>
                            <p className={`${task.cost >= 1000 ? "font-semibold text-yellow-400" : ""} flex-1 max-lg:text-sm lg:line-clamp-2 max-lg:break-words max-lg:text-center lg:text-xs xl:text-base`}>Custo: {formatCost(task.cost)}</p>
                            <p className="flex-1 max-lg:hidden max-lg:text-sm">Data limite: {new Date(task.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            {/* <p className="flex-1">Ordem de apresentação: {task.order}</p> */}
                            <div className="flex gap-2">
                                <button className={`${task.cost >= 1000 ? "hover:text-black hover:bg-white dark:hover:text-black" : "hover:text-white"} rounded max-lg:hidden  p-2 hover:bg-accent duration-200 `} onClick={() => startEditing(task)}><Icon className="max-lg:text-xl text-3xl" icon="material-symbols:edit-square-outline-rounded" /></button>
                                <button className="p-2 hover:bg-red-600 duration-200 rounded hover:text-white max-lg:" onClick={() => setTaskToDelete(task)}><Icon className="text-3xl max-lg:text-xl " icon="material-symbols:delete-outline" /></button>
                            </div>
                        </div>
                    )}
                </div>
            )
            }
        </Draggable >
    );
};
