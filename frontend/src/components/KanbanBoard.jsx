import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import TaskCard from './TaskCard';
import api from '../utils/axios';

const SortableItem = ({ task, ...props }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task._id,
        data: { status: task.status } // Embed status so we can check during drop
    });

    // Stop event propagation inside buttons on TaskCard by disabling drag on them,
    // or we just use `dragHandle` on the wrapper, but for simplicity we wrap the whole card.

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        position: 'relative',
        zIndex: isDragging ? 999 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 cursor-grab active:cursor-grabbing">
            <TaskCard task={task} {...props} />
        </div>
    );
};

const DroppableColumn = ({ id, title, tasks, ...props }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col bg-surface/20 border border-border-main rounded-2xl p-4 min-h-[500px]">
            <h3 className="font-semibold text-text-main mb-4 px-2 flex items-center justify-between">
                {title}
                <span className="bg-surface px-2.5 py-0.5 rounded-full text-xs text-text-muted border border-border-main">{tasks.length}</span>
            </h3>

            <div ref={setNodeRef} className="flex-1">
                <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <SortableItem key={task._id} task={task} {...props} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-border-main rounded-xl p-8 min-h-[120px]">
                            Drop tasks here
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks, setTasks, onEdit, onDelete, onTakeInitiative, onAccept, onView, onApprove, currentUser }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }) // require 5px movement to start drag (allows clicking)
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        const overId = over.id;

        // Find the dragged task
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        // Check Role-based permissions
        if (currentUser?.role === 'admin') {
            if (task.status !== 'pending-approval') {
                toast.error("Admins cannot change active task progress statuses.");
                return;
            }
        } else {
            const isAssigned = task.assignedTo && task.assignedTo.some(u => (u._id || u) === currentUser._id);
            const isCreator = task.user === currentUser._id;
            if (!isAssigned && !isCreator) {
                toast.error("You don't have permission to move this task.");
                return;
            }
        }

        // Determine the target status
        let newStatus;
        if (['pending', 'in-progress', 'completed'].includes(overId)) {
            newStatus = overId; // Dropped directly onto column
        } else {
            // Dropped onto another task
            newStatus = over.data?.current?.status;
        }

        if (!newStatus || task.status === newStatus) return;

        // Prevent moving backwards to To Do
        if ((task.status === 'in-progress' || task.status === 'completed') && newStatus === 'pending') {
            toast.error("Tasks cannot be moved backward to To Do.");
            return;
        }

        // Prevent moving to 'pending-approval' manually, or moving out of it if not admin
        if (task.status === 'pending-approval' && currentUser?.role !== 'admin') {
            toast.error("An Admin must approve this task first.");
            return;
        }

        // Optimistic UI update
        const previousTasks = [...tasks];
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

        try {
            await api.put(`/api/tasks/${taskId}`, { status: newStatus });
            // Let the socket event handle the rest (if toast needed, done globally)
        } catch (err) {
            console.error("Failed to move task:", err);
            toast.error("Failed to update task status.");
            setTasks(previousTasks); // Revert on failure
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'pending-approval');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <DroppableColumn id="pending" title="To Do" tasks={pendingTasks} onEdit={onEdit} onDelete={onDelete} onTakeInitiative={onTakeInitiative} onAccept={onAccept} onView={onView} onApprove={onApprove} currentUser={currentUser} />
                <DroppableColumn id="in-progress" title="In Progress" tasks={inProgressTasks} onEdit={onEdit} onDelete={onDelete} onTakeInitiative={onTakeInitiative} onAccept={onAccept} onView={onView} onApprove={onApprove} currentUser={currentUser} />
                <DroppableColumn id="completed" title="Completed" tasks={completedTasks} onEdit={onEdit} onDelete={onDelete} onTakeInitiative={onTakeInitiative} onAccept={onAccept} onView={onView} onApprove={onApprove} currentUser={currentUser} />
            </div>
        </DndContext>
    );
};

export default KanbanBoard;
