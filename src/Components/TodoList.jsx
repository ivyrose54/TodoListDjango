import { useState, useEffect } from "react";
import axios from "axios";
import "./../../src/index.css";

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingTask, setEditingTask] = useState("");
    const [filter, setFilter] = useState("All");
    const [theme, setTheme] = useState("light");

    const API_URL = "http://127.0.0.1:8000/api/todos/";

    // Fetch tasks from the backend
    useEffect(() => {
        axios.get(API_URL)
            .then((response) => setTasks(response.data))
            .catch((error) => console.error("Error fetching tasks:", error));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const addTask = () => {
        if (task.trim() === "") return;
        axios.post(API_URL, { title: task, completed: false })
            .then((response) => {
                setTasks([...tasks, response.data]);
                setTask("");
            })
            .catch((error) => console.error("Error adding task:", error));
    };

    const removeTask = (id) => {
        axios.delete(`${API_URL}${id}/`)
            .then(() => setTasks(tasks.filter((t) => t.id !== id)))
            .catch((error) => console.error("Error removing task:", error));
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditingTask(tasks[index].title);
    };

    const saveTask = (id) => {
        axios.put(`${API_URL}${id}/`, { title: editingTask, completed: tasks.find((t) => t.id === id).completed })
            .then((response) => {
                setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
                setEditingIndex(null);
                setEditingTask("");
            })
            .catch((error) => console.error("Error saving task:", error));
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditingTask("");
    };

    const toggleCompletion = (id) => {
        const task = tasks.find((t) => t.id === id);
        axios.put(`${API_URL}${id}/`, { title: task.title, completed: !task.completed })
            .then((response) => {
                setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
            })
            .catch((error) => console.error("Error toggling completion:", error));
    };

    const filteredTasks = tasks.filter((t) => {
        if (filter === "Completed") return t.completed;
        if (filter === "Pending") return !t.completed;
        return true;
    });

    return (
        <div className="container">
            <h2>To-Do List</h2>
            <button onClick={toggleTheme}>
                {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>
            <input
                type="text"
                placeholder="Add a new task..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />
            <button onClick={addTask}>Add Task</button>
            <div className="filter-buttons">
                <button onClick={() => setFilter("All")} className={filter === "All" ? "active" : ""}>All</button>
                <button onClick={() => setFilter("Completed")} className={filter === "Completed" ? "active" : ""}>Completed</button>
                <button onClick={() => setFilter("Pending")} className={filter === "Pending" ? "active" : ""}>Pending</button>
            </div>
            <ul>
                {filteredTasks.map((t, index) => (
                    <li key={t.id} className={t.completed ? "completed" : ""}>
                        <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleCompletion(t.id)}
                        />
                        {editingIndex === index ? (
                            <>
                                <input
                                    type="text"
                                    value={editingTask}
                                    onChange={(e) => setEditingTask(e.target.value)}
                                />
                                <button onClick={() => saveTask(t.id)}>Save</button>
                                <button onClick={cancelEditing}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>{t.title}</span>
                                <button onClick={() => startEditing(index)}>Edit</button>
                                <button onClick={() => removeTask(t.id)}>Remove</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}