'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDate, cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'admin', label: 'Admin', color: 'bg-gray-100 text-gray-700' },
  { value: 'client_work', label: 'Client', color: 'bg-green-muted text-green' },
  { value: 'outreach', label: 'Outreach', color: 'bg-blue-50 text-blue-700' },
  { value: 'content', label: 'Content', color: 'bg-purple-50 text-purple-700' },
  { value: 'scraping', label: 'Scraping', color: 'bg-amber-50 text-amber-700' },
  { value: 'cleanup', label: 'Cleanup', color: 'bg-red-50 text-red-600' },
]

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {}
for (const c of CATEGORIES) {
  CATEGORY_MAP[c.value] = { label: c.label, color: c.color }
}

interface Task {
  id: string
  title: string
  completed: boolean
  due_date: string | null
  itinerary_id: string | null
  priority: number
  created_at: string
  completed_at: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  is_recurring: boolean
  recurrence: string | null
  category: string | null
}

interface Props {
  initialTasks: Task[]
  itineraries: Array<{ id: string; clientName: string; title: string }>
}

export default function TaskBoard({ initialTasks, itineraries }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newItineraryId, setNewItineraryId] = useState('')
  const [newCategory, setNewCategory] = useState('admin')
  const [newScheduledDate, setNewScheduledDate] = useState('')
  const [newScheduledTime, setNewScheduledTime] = useState('')
  const [newIsRecurring, setNewIsRecurring] = useState(false)
  const [newRecurrence, setNewRecurrence] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showForm])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setLoading(true)

    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        due_date: newDueDate || null,
        itinerary_id: newItineraryId || null,
        category: newCategory || 'admin',
        scheduled_date: newScheduledDate || null,
        scheduled_time: newScheduledTime || null,
        is_recurring: newIsRecurring,
        recurrence: newIsRecurring && newRecurrence ? newRecurrence : null,
      }),
    })

    if (res.ok) {
      const task = await res.json()
      setTasks((prev) => [task, ...prev])
      setNewTitle('')
      setNewDueDate('')
      setNewItineraryId('')
      setNewCategory('admin')
      setNewScheduledDate('')
      setNewScheduledTime('')
      setNewIsRecurring(false)
      setNewRecurrence('')
      setShowForm(false)
      setShowAdvanced(false)
    }
    setLoading(false)
  }

  async function toggleComplete(id: string, completed: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      )
    )

    await fetch(`/api/admin/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))

    await fetch(`/api/admin/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Filter by category
  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter((t) => (t.category || 'admin') === filterCategory)

  const openTasks = filteredTasks.filter((t) => !t.completed)
  const completedTasks = filteredTasks.filter((t) => t.completed)

  function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false
    return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
  }

  function isDueSoon(dueDate: string | null): boolean {
    if (!dueDate) return false
    const diff = new Date(dueDate).getTime() - new Date().setHours(0, 0, 0, 0)
    return diff >= 0 && diff <= 3 * 86400000
  }

  const itineraryLookup: Record<string, string> = {}
  for (const it of itineraries) {
    itineraryLookup[it.id] = it.clientName
  }

  function renderTaskMeta(task: Task) {
    const cat = CATEGORY_MAP[task.category || 'admin'] || CATEGORY_MAP.admin
    return (
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', cat.color)}>
          {cat.label}
        </span>
        {task.due_date && (
          <span
            className={cn(
              'text-[10px] font-medium',
              isOverdue(task.due_date)
                ? 'text-red-600'
                : isDueSoon(task.due_date)
                  ? 'text-amber-600'
                  : 'text-gray-400'
            )}
          >
            Due {formatDate(task.due_date)}
          </span>
        )}
        {task.scheduled_date && (
          <span className="text-[10px] text-purple-500 font-medium">
            {task.scheduled_time ? `${task.scheduled_time.substring(0, 5)}` : ''} {formatDate(task.scheduled_date)}
          </span>
        )}
        {task.is_recurring && task.recurrence && (
          <span className="text-[10px] text-blue-500 font-medium">
            {task.recurrence}
          </span>
        )}
        {task.itinerary_id && itineraryLookup[task.itinerary_id] && (
          <span className="text-[10px] text-gray-400">
            {itineraryLookup[task.itinerary_id]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
          Tasks
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-green hover:text-green-light transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div className="bg-white rounded-[8px] border border-gray-200">
        {/* Category filter */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'px-2 py-0.5 text-[10px] font-medium rounded font-body transition-colors whitespace-nowrap',
              filterCategory === 'all' ? 'bg-green text-white' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={cn(
                'px-2 py-0.5 text-[10px] font-medium rounded font-body transition-colors whitespace-nowrap',
                filterCategory === cat.value ? 'bg-green text-white' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={addTask} className="p-3 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-sm border border-gray-200 rounded-[4px] px-3 py-2 focus:outline-none focus:border-green font-body"
            />
            <div className="flex gap-2 mt-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body flex-1"
                title="Due date"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body flex-1"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <select
                value={newItineraryId}
                onChange={(e) => setNewItineraryId(e.target.value)}
                className="text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body flex-1"
              >
                <option value="">No project</option>
                {itineraries.map((it) => (
                  <option key={it.id} value={it.id}>{it.clientName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-gray-400 hover:text-gray-600 font-body px-2"
              >
                {showAdvanced ? 'Less' : 'Schedule'}
              </button>
            </div>

            {/* Advanced scheduling fields */}
            {showAdvanced && (
              <div className="mt-2 p-2 bg-gray-50 rounded space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-body block mb-0.5">Scheduled date</label>
                    <input
                      type="date"
                      value={newScheduledDate}
                      onChange={(e) => setNewScheduledDate(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-body block mb-0.5">Time</label>
                    <input
                      type="time"
                      value={newScheduledTime}
                      onChange={(e) => setNewScheduledTime(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsRecurring}
                      onChange={(e) => setNewIsRecurring(e.target.checked)}
                      className="rounded border-gray-300 text-green focus:ring-green"
                    />
                    <span className="text-xs text-gray-600 font-body">Recurring</span>
                  </label>
                  {newIsRecurring && (
                    <select
                      value={newRecurrence}
                      onChange={(e) => setNewRecurrence(e.target.value)}
                      className="text-xs border border-gray-200 rounded-[4px] px-2 py-1.5 focus:outline-none focus:border-green font-body"
                    >
                      <option value="">Select...</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newTitle.trim()}
              className="mt-2 w-full text-xs font-medium bg-green text-white rounded-[4px] px-3 py-2 hover:bg-green-light transition-colors disabled:opacity-50"
            >
              Add Task
            </button>
          </form>
        )}

        {/* Open tasks */}
        {openTasks.length === 0 && !showForm && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400">
              {filterCategory === 'all' ? 'All clear' : 'No tasks in this category'}
            </p>
          </div>
        )}

        {openTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 border-b border-gray-50 last:border-b-0 group"
          >
            <button
              onClick={() => toggleComplete(task.id, true)}
              className="mt-0.5 w-4 h-4 shrink-0 rounded border-2 border-gray-300 hover:border-green transition-colors"
              aria-label="Complete task"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-body">{task.title}</p>
              {renderTaskMeta(task)}
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-xs shrink-0 p-1"
              aria-label="Delete task"
            >
              &#10005;
            </button>
          </div>
        ))}

        {/* Completed tasks (collapsed) */}
        {completedTasks.length > 0 && (
          <details className="border-t border-gray-100">
            <summary className="px-3 py-2 text-xs text-gray-400 cursor-pointer hover:text-gray-600 font-body">
              {completedTasks.length} completed
            </summary>
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 px-3 py-2 group"
              >
                <button
                  onClick={() => toggleComplete(task.id, false)}
                  className="mt-0.5 w-4 h-4 shrink-0 rounded border-2 border-green bg-green flex items-center justify-center"
                  aria-label="Undo complete"
                >
                  <span className="text-white text-[8px]">&#10003;</span>
                </button>
                <p className="text-sm text-gray-400 line-through font-body flex-1 min-w-0 truncate">
                  {task.title}
                </p>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-xs shrink-0 p-1"
                  aria-label="Delete task"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </details>
        )}
      </div>
    </div>
  )
}
