import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Spline from '@splinetool/react-spline'
import { MapPin, Mic, Send, BarChart3, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const StatCard = ({ label, value, color, onClick }) => (
  <button onClick={onClick} className="group rounded-2xl p-5 bg-white/70 backdrop-blur border border-white/60 shadow-sm hover:shadow-md transition w-full text-left">
    <div className="text-sm text-gray-500 flex items-center gap-2">
      <BarChart3 className="h-4 w-4" /> {label}
    </div>
    <div className={`mt-2 text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
      {value}
    </div>
  </button>
)

const Badge = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>{children}</span>
}

function ComplaintList({ items, title }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() =>
    items.filter(i => (i.text||'').toLowerCase().includes(q.toLowerCase())), [items, q])

  return (
    <div className="rounded-2xl p-5 bg-white/80 backdrop-blur border border-white/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500"><Filter className="h-4 w-4" />{filtered.length} shown</div>
      </div>
      <div className="space-y-3 max-h-96 overflow-auto pr-1">
        {filtered.map(c => (
          <div key={c.complaint_id} className="p-3 rounded-xl border bg-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.text}</div>
              <Badge tone={c.status === 'Resolved' ? 'green' : c.status === 'In Progress' ? 'yellow' : 'red'}>{c.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              <Badge tone="purple">{c.category}</Badge>
              <Badge tone={c.priority === 'High' ? 'red' : c.priority === 'Medium' ? 'yellow' : 'green'}>{c.priority}</Badge>
              {c.district && <Badge tone="blue">{c.district}</Badge>}
            </div>
            {c.location && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location.lat}, {c.location.lng}</div>
            )}
          </div>
        ))}
        {!filtered.length && (
          <div className="text-sm text-gray-500">No complaints</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 })
  const [all, setAll] = useState([])
  const [view, setView] = useState('all') // 'pending' | 'resolved' | 'in_progress' | 'all'
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Others')
  const [priority, setPriority] = useState('Medium')
  const [level, setLevel] = useState('Local')

  const fetchStats = async () => {
    const r = await fetch(`${API_BASE}/stats`)
    const d = await r.json()
    setStats(d)
  }
  const fetchAll = async (status) => {
    const url = new URL(`${API_BASE}/complaints`)
    if (status) url.searchParams.set('status', status)
    const r = await fetch(url)
    const d = await r.json()
    setAll(d)
  }

  useEffect(() => {
    fetchStats()
    fetchAll()
    const id = setInterval(() => { fetchStats(); if (view==='all') fetchAll(); }, 4000)
    return () => clearInterval(id)
  }, [view])

  const categories = [
    'Roads','Water','Electricity','Health','Education','Sanitation','Public Transport','Waste Management','Safety','Others'
  ]

  const handleCreate = async () => {
    if (!text.trim()) return
    const payload = {
      user_id: 'DEMO',
      text,
      category,
      priority,
      level,
    }
    const r = await fetch(`${API_BASE}/complaints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (r.ok) {
      setText('')
      fetchStats();
      if (view==='all') fetchAll();
    }
  }

  const showSet = async (key) => {
    setView(key)
    if (key==='all') return fetchAll()
    if (key==='pending') return fetchAll('Pending')
    if (key==='resolved') return fetchAll('Resolved')
    if (key==='in_progress') return fetchAll('In Progress')
  }

  const gradient = 'from-purple-500 via-blue-500 to-orange-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="relative h-[380px]">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-white/30 to-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center px-6">
            <div className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-white/70 backdrop-blur border` }>
              <Mic className="h-4 w-4 text-purple-600" /> Voice + Multilingual AI
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-orange-500">
              CitizenConnect 2.0
            </h1>
            <p className="mt-3 text-gray-700 max-w-2xl mx-auto">Report issues in any Indian language. Smart AI routes them instantly and keeps you updated.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Complaints" value={stats.total} color={`from-purple-600 to-blue-600`} onClick={() => showSet('all')} />
          <StatCard label="Pending" value={stats.pending} color={`from-yellow-500 to-orange-500`} onClick={() => showSet('pending')} />
          <StatCard label="In Progress" value={stats.in_progress} color={`from-blue-500 to-purple-500`} onClick={() => showSet('in_progress')} />
          <StatCard label="Resolved" value={stats.resolved} color={`from-green-500 to-emerald-500`} onClick={() => showSet('resolved')} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <ComplaintList items={all} title={
              view==='all' ? 'All Complaints' : view==='pending' ? 'Pending Complaints' : view==='resolved' ? 'Resolved Complaints' : 'In Progress Complaints'
            } />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl p-5 bg-white/80 backdrop-blur border border-white/60">
              <h3 className="text-lg font-semibold mb-3">Quick Report</h3>
              <div className="space-y-3">
                <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe your issue (any language)" className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[90px]" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border p-2">
                    {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={priority} onChange={e=>setPriority(e.target.value)} className="rounded-xl border p-2">
                    {['High','Medium','Low'].map(p=> <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <select value={level} onChange={e=>setLevel(e.target.value)} className="rounded-xl border p-2 w-full">
                  {['Local','State','Central'].map(l=> <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={handleCreate} className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white bg-gradient-to-r ${gradient} hover:opacity-90 transition`}>
                  <Send className="h-4 w-4" /> Submit
                </button>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Voice input, AI classification, translation, and maps are part of the full build and can be enabled next.
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-white/80 backdrop-blur border border-white/60">
              <h3 className="text-lg font-semibold mb-3">At a glance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Clock className="h-4 w-4" /> Live auto-refresh every few seconds</div>
                <div className="flex items-center gap-2 text-gray-600"><CheckCircle2 className="h-4 w-4" /> Click any stat to filter the list</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 py-8 text-center text-xs text-gray-500">CitizenConnect 2.0 — Demo UI. Firebase/Gemini/Maps integrations can be wired next.</footer>
    </div>
  )
}
