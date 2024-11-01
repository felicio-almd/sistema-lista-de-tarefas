'use client'
import { useState } from "react";
import Footer from "../components/footer";

export default function Welcome () {
    const [task, setTask] = useState("");
    
    return (
        <>
        <main className="w-full h-screen flex items-center justify-center flex-col">
            <h1>Sistema lista de Tarefas</h1>
            <h2>Tarefas</h2>
            <input type="text" placeholder="Adicionar tarefa" value={task} onChange={(e) => setTask(e.target.value)}/>
        </main>

        <Footer />
        </>
    )
}