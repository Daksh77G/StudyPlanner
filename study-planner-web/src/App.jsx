import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import './App.css'

function App() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()

  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear + i))
  const hourOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

  const [taskName, setTaskName] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('Exam')
  const [difficulty, setDifficulty] = useState('Medium')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [priority, setPriority] = useState('High')

  const [deadlineMonth, setDeadlineMonth] = useState(String(currentMonth).padStart(2, '0'))
  const [deadlineDay, setDeadlineDay] = useState(String(currentDay).padStart(2, '0'))
  const [deadlineYear, setDeadlineYear] = useState(String(currentYear))
  const [deadlineHour, setDeadlineHour] = useState('11')
  const [deadlineMinute, setDeadlineMinute] = useState('59')
  const [deadlinePeriod, setDeadlinePeriod] = useState('PM')

  const [studyHour, setStudyHour] = useState('6')
  const [studyMinute, setStudyMinute] = useState('00')
  const [studyPeriod, setStudyPeriod] = useState('PM')

  const [filter, setFilter] = useState('All')
  const [viewPage, setViewPage] = useState('Monthly')
  const [tasks, setTasks] = useState([])
  const [optimizeVersion, setOptimizeVersion] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  useEffect(() => {
    const savedTasks = localStorage.getItem('studyPlannerTasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks))
  }, [tasks])

  function formatMinuteInput(value) {
    const digitsOnly = value.replace(/\D/g, '')
    if (digitsOnly === '') return ''
    const number = Math.min(59, Math.max(0, Number(digitsOnly)))
    return String(number).padStart(2, '0')
  }

  function convertTo24Hour(hour, minute, period) {
    let h = Number(hour)

    if (period === 'AM' && h === 12) h = 0
    if (period === 'PM' && h !== 12) h += 12

    return `${String(h).padStart(2, '0')}:${String(Number(minute)).padStart(2, '0')}`
  }

  function format12HourDisplay(hour, minute, period) {
    return `${hour}:${minute || '00'} ${period}`
  }

  function formatDateLabel(dateValue) {
    return new Date(dateValue).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function buildDeadline() {
    const deadlineTime24 = convertTo24Hour(
      deadlineHour,
      deadlineMinute || '00',
      deadlinePeriod
    )

    return `${deadlineYear}-${deadlineMonth}-${deadlineDay}T${deadlineTime24}`
  }

  function isOverdue(task) {
    return !task.completed && new Date(task.deadline) < new Date()
  }

  function startOfToday() {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }

  function endOfToday() {
    const date = new Date()
    date.setHours(23, 59, 59, 999)
    return date
  }

  function startOfWeek(date = new Date()) {
    const result = new Date(date)
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day
    result.setDate(result.getDate() + diff)
    result.setHours(0, 0, 0, 0)
    return result
  }

  function endOfWeek(date = new Date()) {
    const result = startOfWeek(date)
    result.setDate(result.getDate() + 6)
    result.setHours(23, 59, 59, 999)
    return result
  }

  function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
  }

  function endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  function isInCurrentView(dateValue, view) {
    const date = new Date(dateValue)

    if (view === 'Daily') {
      return date >= startOfToday() && date <= endOfToday()
    }

    if (view === 'Weekly') {
      return date >= startOfWeek() && date <= endOfWeek()
    }

    return date >= startOfMonth() && date <= endOfMonth()
  }

  function getCalendarView(view) {
    if (view === 'Daily') return 'timeGridDay'
    if (view === 'Weekly') return 'timeGridWeek'
    return 'dayGridMonth'
  }

  function getTaskXP(task) {
    const difficultyXP = { Easy: 20, Medium: 40, Hard: 70 }
    const priorityXP = { Low: 5, Medium: 10, High: 20 }
    const typeXP = { Homework: 10, Quiz: 15, Reading: 10, Project: 25, Exam: 30 }

    return (
      (difficultyXP[task.difficulty] || 20) +
      (priorityXP[task.priority] || 5) +
      (typeXP[task.type] || 10) +
      Math.round(Number(task.estimatedHours || 0) * 8)
    )
  }

  function getRankName(level) {
    if (level >= 12) return 'Master Strategist'
    if (level >= 9) return 'Focus Architect'
    if (level >= 6) return 'Deadline Slayer'
    if (level >= 3) return 'Study Warrior'
    return 'Rookie Scholar'
  }

  function getSessionTitle(task) {
    if (task.type === 'Exam') return `Study for ${task.subject} Exam`
    if (task.type === 'Homework') return `Work on ${task.name}`
    if (task.type === 'Quiz') return `Review for ${task.subject} Quiz`
    if (task.type === 'Project') return `Project work: ${task.name}`
    if (task.type === 'Reading') return `Complete reading: ${task.name}`
    return `Study: ${task.name}`
  }

  function getUrgencyWeight(task) {
    const priorityWeight = { Low: 1, Medium: 1.4, High: 1.9 }
    const difficultyWeight = { Easy: 1, Medium: 1.3, Hard: 1.7 }
    const typeWeight = { Reading: 1, Homework: 1.1, Quiz: 1.25, Project: 1.45, Exam: 1.75 }

    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    const timePressure = daysLeft <= 2 ? 2.2 : daysLeft <= 5 ? 1.6 : daysLeft <= 10 ? 1.25 : 1
    const estimatePressure = Math.max(1, Number(task.estimatedHours || 1) / 2)

    return (
      (priorityWeight[task.priority] || 1) *
      (difficultyWeight[task.difficulty] || 1) *
      (typeWeight[task.type] || 1) *
      timePressure *
      estimatePressure
    )
  }

  function extractStudyTopic(task) {
    const combined = `${task.name} ${task.subject}`.toLowerCase()

    const topicRules = [
      {
        keywords: ['integral', 'integration', 'calc', 'calculus', 'derivative', 'limit'],
        topic: 'calculus integrals',
      },
      {
        keywords: ['stoichiometry', 'chemistry', 'mole', 'reaction', 'titration'],
        topic: 'chemistry stoichiometry',
      },
      {
        keywords: ['essay', 'literature', 'analysis', 'theme', 'novel', 'poem'],
        topic: 'literary analysis essay writing',
      },
      {
        keywords: ['physics', 'kinematics', 'force', 'energy', 'momentum'],
        topic: 'physics problem solving',
      },
      {
        keywords: ['biology', 'cell', 'genetics', 'evolution', 'photosynthesis'],
        topic: 'biology concepts review',
      },
      {
        keywords: ['history', 'ww2', 'war', 'revolution', 'document analysis'],
        topic: 'history study guide',
      },
      {
        keywords: ['programming', 'coding', 'java', 'python', 'c++', 'algorithm'],
        topic: 'programming algorithms tutorial',
      },
      {
        keywords: ['statistics', 'probability', 'regression', 'data', 'distribution'],
        topic: 'statistics fundamentals',
      },
    ]

    for (const rule of topicRules) {
      if (rule.keywords.some((keyword) => combined.includes(keyword))) {
        return rule.topic
      }
    }

    return task.subject ? `${task.subject} study help` : `${task.name} study help`
  }

  function buildResourceLinks(task) {
    const topic = extractStudyTopic(task)
    const encoded = encodeURIComponent(topic)

    return [
      {
        label: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encoded}`,
      },
      {
        label: 'Khan Academy',
        url: `https://www.google.com/search?q=${encodeURIComponent(`site:khanacademy.org ${topic}`)}`,
      },
      {
        label: 'Wikipedia',
        url: `https://www.google.com/search?q=${encodeURIComponent(`site:wikipedia.org ${topic}`)}`,
      },
      {
        label: 'Practice Problems',
        url: `https://www.google.com/search?q=${encodeURIComponent(`${topic} practice problems`)}`,
      },
    ]
  }

  function handleAddTask(e) {
    e.preventDefault()

    const finalDeadline = buildDeadline()

    if (!taskName.trim() || !subject.trim() || !estimatedHours || !deadlineDay) {
      alert('Please fill in all required fields.')
      return
    }

    const testDate = new Date(finalDeadline)
    if (Number.isNaN(testDate.getTime())) {
      alert('Please enter a valid deadline date.')
      return
    }

    const newTask = {
      id: Date.now(),
      name: taskName,
      subject,
      type,
      difficulty,
      estimatedHours: Number(estimatedHours),
      priority,
      deadline: finalDeadline,
      studyTime: {
        hour: studyHour,
        minute: studyMinute || '00',
        period: studyPeriod,
      },
      completed: false,
    }

    setTasks((prev) => [...prev, newTask])
    setSelectedTaskId(newTask.id)

    setTaskName('')
    setSubject('')
    setType('Exam')
    setDifficulty('Medium')
    setEstimatedHours('')
    setPriority('High')
    setDeadlineMonth(String(currentMonth).padStart(2, '0'))
    setDeadlineDay(String(currentDay).padStart(2, '0'))
    setDeadlineYear(String(currentYear))
    setDeadlineHour('11')
    setDeadlineMinute('59')
    setDeadlinePeriod('PM')
    setStudyHour('6')
    setStudyMinute('00')
    setStudyPeriod('PM')
  }

  function handleDeleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    if (selectedTaskId === id) {
      setSelectedTaskId(null)
    }
  }

  function handleToggleComplete(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  function handleOptimizePlan() {
    setOptimizeVersion((prev) => prev + 1)
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )
  }, [tasks])

  useEffect(() => {
    if (!selectedTaskId && sortedTasks.length > 0) {
      setSelectedTaskId(sortedTasks[0].id)
    }
  }, [sortedTasks, selectedTaskId])

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'Active':
        return sortedTasks.filter((task) => !task.completed)
      case 'Completed':
        return sortedTasks.filter((task) => task.completed)
      case 'Overdue':
        return sortedTasks.filter((task) => isOverdue(task))
      default:
        return sortedTasks
    }
  }, [filter, sortedTasks])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.completed).length
    const active = tasks.filter((task) => !task.completed).length
    const overdue = tasks.filter((task) => isOverdue(task)).length
    return { total, completed, active, overdue }
  }, [tasks])

  const studySessions = useMemo(() => {
    const sessions = []

    sortedTasks.forEach((task) => {
      if (task.completed) return

      const deadlineDate = new Date(task.deadline)
      const taskDeadlineDay = new Date(deadlineDate)
      taskDeadlineDay.setHours(0, 0, 0, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let finalStudyDay = new Date(taskDeadlineDay)

      if (task.type === 'Exam') {
        finalStudyDay.setDate(finalStudyDay.getDate() - 1)
      }

      if (finalStudyDay < today) return

      const daysAvailable =
        Math.floor((finalStudyDay - today) / (1000 * 60 * 60 * 24)) + 1

      const sessionCount = Math.min(task.estimatedHours, Math.max(1, daysAvailable))
      const hoursPerSession = task.estimatedHours / sessionCount
      const urgencyWeight = getUrgencyWeight(task)

      for (let i = 0; i < sessionCount; i++) {
        let offsetDays

        if (optimizeVersion === 0) {
          offsetDays = i
        } else {
          const weightedSpread = Math.max(
            1,
            Math.ceil(daysAvailable / Math.max(1.2, Math.min(urgencyWeight, daysAvailable)))
          )
          offsetDays = Math.min(i * weightedSpread, daysAvailable - 1)
        }

        const sessionDate = new Date(today)
        sessionDate.setDate(today.getDate() + offsetDays)

        if (sessionDate > finalStudyDay) {
          sessionDate.setTime(finalStudyDay.getTime())
        }

        const savedStudyTime = task.studyTime || {
          hour: '6',
          minute: '00',
          period: 'PM',
        }

        const time24 = convertTo24Hour(
          savedStudyTime.hour,
          savedStudyTime.minute,
          savedStudyTime.period
        )

        const [hours, minutes] = time24.split(':')
        sessionDate.setHours(Number(hours), Number(minutes), 0, 0)

        sessions.push({
          id: `${task.id}-study-${i}-${optimizeVersion}`,
          taskId: task.id,
          title: getSessionTitle(task),
          taskName: task.name,
          start: sessionDate.toISOString(),
          dateLabel: sessionDate.toLocaleString(),
          minutes: Math.round(hoursPerSession * 60),
          type: task.type,
          priority: task.priority,
          optimized: optimizeVersion > 0,
          urgencyWeight,
        })
      }
    })

    return sessions.sort((a, b) => new Date(a.start) - new Date(b.start))
  }, [sortedTasks, optimizeVersion])

  const visibleStudySessions = useMemo(() => {
    return studySessions.filter((session) => isInCurrentView(session.start, viewPage))
  }, [studySessions, viewPage])

  const dueItemsForView = useMemo(() => {
    return sortedTasks
      .filter((task) => !task.completed)
      .filter((task) => isInCurrentView(task.deadline, viewPage))
  }, [sortedTasks, viewPage])

  const dueDateEvents = useMemo(() => {
    return dueItemsForView.map((task) => ({
      id: `${task.id}-due`,
      title: `Due: ${task.name}`,
      date: new Date(task.deadline).toISOString().split('T')[0],
      allDay: true,
      className: 'deadline-event',
    }))
  }, [dueItemsForView])

  const studyCalendarEvents = useMemo(() => {
    return visibleStudySessions.map((session) => ({
      id: session.id,
      title: `${session.title} (${session.minutes} min)`,
      start: session.start,
      allDay: false,
      className: session.optimized ? 'study-event optimized-event' : 'study-event',
    }))
  }, [visibleStudySessions])

  const calendarEvents = useMemo(() => {
    return [...studyCalendarEvents, ...dueDateEvents]
  }, [studyCalendarEvents, dueDateEvents])

  const totalStudyMinutesInView = useMemo(() => {
    return visibleStudySessions.reduce((sum) => sum + 1, 0)
  }, [visibleStudySessions])

  const topUpcomingItems = useMemo(() => {
    const dueCards = dueItemsForView.map((task) => ({
      id: `due-card-${task.id}`,
      kind: 'Due',
      title: task.name,
      subtitle: `${task.subject} • ${task.type}`,
      timestamp: new Date(task.deadline).getTime(),
      when: formatDateLabel(task.deadline),
    }))

    const studyCards = visibleStudySessions.map((session) => ({
      id: `study-card-${session.id}`,
      kind: 'Study',
      title: session.title,
      subtitle: `${session.taskName} • ${session.minutes} min`,
      timestamp: new Date(session.start).getTime(),
      when: formatDateLabel(session.start),
    }))

    return [...dueCards, ...studyCards]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 6)
  }, [dueItemsForView, visibleStudySessions])

  const rightPanelSummary = useMemo(() => {
    return [
      { label: `${viewPage} due items`, value: dueItemsForView.length },
      { label: `${viewPage} study sessions`, value: visibleStudySessions.length },
      { label: `${viewPage} study minutes`, value: totalStudyMinutesInView },
    ]
  }, [viewPage, dueItemsForView, visibleStudySessions, totalStudyMinutesInView])

  const commandCenter = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed)
    const completedCount = completedTasks.length
    const xp = completedTasks.reduce((sum, task) => sum + getTaskXP(task), 0)
    const level = Math.floor(xp / 100) + 1
    const currentLevelXP = xp % 100
    const xpToNextLevel = 100 - currentLevelXP
    const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
    const streak = Math.min(30, completedCount + Math.floor(completedCount / 2))
    const rank = getRankName(level)

    const todayDue = tasks.filter((task) => {
      const deadline = new Date(task.deadline)
      return deadline >= startOfToday() && deadline <= endOfToday() && !task.completed
    }).length

    const todayStudySessions = studySessions.filter((session) => {
      const start = new Date(session.start)
      return start >= startOfToday() && start <= endOfToday()
    }).length

    const dailyQuests = [
      { id: 'quest-1', label: 'Complete 1 task today', done: completedCount >= 1 },
      { id: 'quest-2', label: 'Keep today under 3 due items', done: todayDue <= 3 },
      { id: 'quest-3', label: 'Have at least 1 study session scheduled today', done: todayStudySessions >= 1 },
    ]

    return {
      xp,
      level,
      currentLevelXP,
      xpToNextLevel,
      completionRate,
      streak,
      rank,
      dailyQuests,
    }
  }, [tasks, studySessions])

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === selectedTaskId) || filteredTasks[0] || tasks[0] || null
  }, [tasks, filteredTasks, selectedTaskId])

  const smartRecommendations = useMemo(() => {
    if (!selectedTask) return null
    return {
      topic: extractStudyTopic(selectedTask),
      links: buildResourceLinks(selectedTask),
    }
  }, [selectedTask])

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <p className="topbar-kicker">Planner workspace</p>
          <h1>Study Planner</h1>
          <p className="subtitle">Stay organized, focused, and ahead of your deadlines.</p>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-button"
            onClick={() => setViewPage('Daily')}
          >
            Today
          </button>
          <button
            type="button"
            className="topbar-button"
            onClick={() => setViewPage('Weekly')}
          >
            This Week
          </button>
          <button
            type="button"
            className="topbar-button"
            onClick={() => setViewPage('Monthly')}
          >
            This Month
          </button>
        </div>
      </div>

      <section className="command-center">
        <div className="command-center-main">
          <div className="command-kicker">Study Command Center</div>
          <h2>Build momentum, not just a to-do list.</h2>
          <p>
            Earn XP for completed work, level up your planner profile, and keep your streak alive
            by staying consistent.
          </p>

          <div className="xp-block">
            <div className="xp-meta">
              <span className="xp-label">Level {commandCenter.level}</span>
              <strong>{commandCenter.rank}</strong>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${commandCenter.currentLevelXP}%` }}
              ></div>
            </div>
            <small>{commandCenter.xpToNextLevel} XP to next level</small>
          </div>
        </div>

        <div className="command-center-grid">
          <div className="command-stat">
            <span>Total XP</span>
            <strong>{commandCenter.xp}</strong>
          </div>
          <div className="command-stat">
            <span>Current Streak</span>
            <strong>{commandCenter.streak} days</strong>
          </div>
          <div className="command-stat">
            <span>Completion Rate</span>
            <strong>{commandCenter.completionRate}%</strong>
          </div>
        </div>

        <div className="quest-board">
          <h3>Daily Quests</h3>
          <div className="quest-list">
            {commandCenter.dailyQuests.map((quest) => (
              <div
                key={quest.id}
                className={`quest-item ${quest.done ? 'quest-done' : ''}`}
              >
                <span className="quest-status">{quest.done ? '✓' : '•'}</span>
                <p>{quest.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
        <div className="stat-card">
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </div>
      </div>

      <div className="filter-row planner-controls">
        {['Daily', 'Weekly', 'Monthly'].map((page) => (
          <button
            key={page}
            type="button"
            className={viewPage === page ? 'filter-button active-filter' : 'filter-button'}
            onClick={() => setViewPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="filter-button optimize-button"
          onClick={handleOptimizePlan}
        >
          Optimize My Plan
        </button>
      </div>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Exam</option>
          <option>Homework</option>
          <option>Quiz</option>
          <option>Project</option>
          <option>Reading</option>
        </select>

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Estimated study hours"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
        />

        <div className="input-group">
          <label className="input-label">Deadline</label>
          <div className="deadline-grid">
            <select value={deadlineMonth} onChange={(e) => setDeadlineMonth(e.target.value)}>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              max="31"
              placeholder="Day"
              value={deadlineDay}
              onChange={(e) => setDeadlineDay(e.target.value.padStart(2, '0'))}
            />

            <select value={deadlineYear} onChange={(e) => setDeadlineYear(e.target.value)}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="time-picker-row">
            <select value={deadlineHour} onChange={(e) => setDeadlineHour(e.target.value)}>
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              max="59"
              placeholder="Min"
              value={deadlineMinute}
              onChange={(e) => setDeadlineMinute(formatMinuteInput(e.target.value))}
            />

            <select value={deadlinePeriod} onChange={(e) => setDeadlinePeriod(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Preferred study time</label>
          <div className="time-picker-row">
            <select value={studyHour} onChange={(e) => setStudyHour(e.target.value)}>
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              max="59"
              placeholder="Min"
              value={studyMinute}
              onChange={(e) => setStudyMinute(formatMinuteInput(e.target.value))}
            />

            <select value={studyPeriod} onChange={(e) => setStudyPeriod(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      <div className="planner-layout planner-layout-wide">
        <aside className="side-panel">
          <div className="side-panel-card">
            <h3>Upcoming</h3>
            {topUpcomingItems.length === 0 ? (
              <p className="side-panel-empty">Nothing scheduled in this view.</p>
            ) : (
              topUpcomingItems.map((item) => (
                <div key={item.id} className="side-item">
                  <span className={`side-badge ${item.kind === 'Due' ? 'due-badge' : 'study-badge'}`}>
                    {item.kind}
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                  <small>{item.when}</small>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="planner-main">
          <div className="plan-card">
            <div className="section-heading-row">
              <h2>{viewPage} Schedule</h2>
              {optimizeVersion > 0 && <span className="optimized-pill">AI Optimized</span>}
            </div>

            {visibleStudySessions.length === 0 ? (
              <p className="plan-empty">No study sessions in this time range.</p>
            ) : (
              visibleStudySessions.slice(0, 12).map((session) => (
                <div key={session.id} className="plan-item">
                  <div>
                    <strong>{session.title}</strong>
                    <p>{session.taskName} • {session.type} • {session.priority} priority</p>
                    <p>{session.dateLabel}</p>
                  </div>
                  <span>{session.minutes} min</span>
                </div>
              ))
            )}
          </div>

          <div className="calendar-card">
            <div className="calendar-header">
              <h2>{viewPage} Calendar</h2>
              <div className="calendar-legend">
                <span className="legend-item">
                  <span className="legend-dot study-dot"></span>
                  Study Session
                </span>
                <span className="legend-item">
                  <span className="legend-dot deadline-dot"></span>
                  Due Date
                </span>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView={getCalendarView(viewPage)}
              key={`${viewPage}-${optimizeVersion}`}
              height={viewPage === 'Monthly' ? 'auto' : 720}
              events={calendarEvents}
              displayEventTime={true}
              slotMinTime="04:00:00"
              slotMaxTime="24:00:00"
              slotDuration="04:00:00"
              slotLabelInterval="04:00:00"
              expandRows={true}
              nowIndicator={true}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
            />
          </div>
        </main>

        <aside className="side-panel">
          <div className="side-panel-card">
            <h3>{viewPage} Snapshot</h3>
            {rightPanelSummary.map((item) => (
              <div key={item.label} className="summary-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="side-panel-card">
            <h3>Smart Recommendations</h3>
            {selectedTask ? (
              <>
                <div className="recommendation-task">
                  <span className="recommendation-label">Selected task</span>
                  <strong>{selectedTask.name}</strong>
                  <p>{selectedTask.subject} • {selectedTask.type}</p>
                </div>

                <div className="recommendation-topic">
                  <span className="recommendation-label">Detected topic</span>
                  <strong>{smartRecommendations?.topic}</strong>
                </div>

                <div className="resource-links">
                  {smartRecommendations?.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p className="side-panel-empty">Select or add a task to see recommendations.</p>
            )}
          </div>

          <div className="side-panel-card">
            <h3>Navigation</h3>
            <button
              type="button"
              className="side-action-button"
              onClick={() => setViewPage('Daily')}
            >
              Open Daily
            </button>
            <button
              type="button"
              className="side-action-button"
              onClick={() => setViewPage('Weekly')}
            >
              Open Weekly
            </button>
            <button
              type="button"
              className="side-action-button"
              onClick={() => setViewPage('Monthly')}
            >
              Open Monthly
            </button>
          </div>
        </aside>
      </div>

      <div className="filter-row">
        {['All', 'Active', 'Completed', 'Overdue'].map((filterName) => (
          <button
            key={filterName}
            type="button"
            className={filter === filterName ? 'filter-button active-filter' : 'filter-button'}
            onClick={() => setFilter(filterName)}
          >
            {filterName}
          </button>
        ))}
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p className="no-tasks">No tasks match this filter.</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''} ${selectedTaskId === task.id ? 'selected-task-card' : ''}`}
            >
              <div className="task-card-top">
                <h3>{task.name}</h3>
                <span className="task-type">{task.type}</span>
              </div>

              <p><strong>Subject:</strong> {task.subject}</p>
              <p><strong>Difficulty:</strong> {task.difficulty}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              <p><strong>Estimated Hours:</strong> {task.estimatedHours}</p>
              <p>
                <strong>Preferred Study Time:</strong>{' '}
                {task.studyTime
                  ? format12HourDisplay(task.studyTime.hour, task.studyTime.minute, task.studyTime.period)
                  : '6:00 PM'}
              </p>
              <p><strong>Due:</strong> {new Date(task.deadline).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                {task.completed ? 'Completed' : isOverdue(task) ? 'Overdue' : 'Not completed'}
              </p>

              <div className="task-buttons">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleComplete(task.id)
                  }}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTask(task.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App