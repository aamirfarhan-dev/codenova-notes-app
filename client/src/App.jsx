
import { useEffect, useRef, useState } from 'react'
import './App.css'

const API = `${import.meta.env.VITE_API_URL || ''}/api/notes`

function App() {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const cardRefs = useRef([])

  async function loadNotes(query = search) {
    setLoading(true)
    setError('')

    try {
      const url = query.trim()
        ? `${API}?search=${encodeURIComponent(query.trim())}`
        : API

      const response = await fetch(url)
      if (!response.ok) throw new Error('Could not load notes.')

      setNotes(await response.json())
    } catch {
      setError('Unable to connect to the Notes API. Check that your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes('')
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadNotes(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const elements = cardRefs.current.filter(Boolean)
    if (!elements.length) return

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -25px 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [notes, loading, search])

  function resetForm() {
    setTitle('')
    setContent('')
    setEditingId(null)
    setFormOpen(false)
  }

  function startNewNote() {
    resetForm()
    setError('')
    setMessage('')
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => document.getElementById('title')?.focus(), 250)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and note content.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        },
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save note.')

      const wasEditing = editingId !== null
      resetForm()
      setMessage(wasEditing ? 'Note updated successfully.' : 'Note created successfully.')
      await loadNotes(search)
    } catch (err) {
      setError(err.message || 'Unable to save note.')
    } finally {
      setSaving(false)
    }
  }

  function startEditing(note) {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setFormOpen(true)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteNote(id) {
    if (!window.confirm('Delete this note permanently?')) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to delete note.')

      if (editingId === id) resetForm()
      setMessage('Note deleted successfully.')
      await loadNotes(search)
    } catch (err) {
      setError(err.message || 'Unable to delete note.')
    }
  }

  const visibleCount = notes.length

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a className="brand" href="#main" aria-label="CodeNova Notes home">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="3.5" width="14" height="17" rx="3" />
              <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>CodeNova</strong>
            <small>Notes workspace</small>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>
        <button className="nav-item active" type="button" onClick={() => {
          setSearch('')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}>
          <span className="nav-icon">▤</span>
          <span>All notes</span>
          <span className="nav-count">{visibleCount}</span>
        </button>

        <div className="sidebar-divider" />

        <div className="sidebar-tip">
          <span className="tip-icon">✦</span>
          <h3>A little space for big ideas.</h3>
          <p>Capture what matters. Keep moving forward, one thought at a time.</p>
        </div>

        <div className="sidebar-bottom">
          <span className="online-dot" />
          Your workspace is ready
        </div>
      </aside>

      <main className="main-panel" id="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>My notes</strong>
          </div>
          <button className="button primary top-create" type="button" onClick={startNewNote}>
            <span aria-hidden="true">＋</span> New note
          </button>
        </header>

        <div className="page-content">
          <section className="page-intro">
            <div>
              <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
              <h1>My notes<span className="title-period">.</span></h1>
              <p className="page-subtitle">A clear mind starts with a place to put your thoughts.</p>
            </div>
            <div className="intro-stat">
              <span className="stat-number">{visibleCount}</span>
              <span className="stat-label">{visibleCount === 1 ? 'note saved' : 'notes saved'}</span>
            </div>
          </section>

          {formOpen && (
            <section className="editor-panel" id="note-editor">
              <div className="editor-heading">
                <div className="editor-icon">✎</div>
                <div>
                  <p className="eyebrow">{editingId === null ? 'CREATE SOMETHING' : 'MAKE AN UPDATE'}</p>
                  <h2>{editingId === null ? 'Create a new note' : 'Edit your note'}</h2>
                </div>
                <button className="icon-button close-editor" type="button" onClick={resetForm} aria-label="Close editor">×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Give your note a title"
                  maxLength={120}
                  required
                />

                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write down what's on your mind..."
                  rows={5}
                  maxLength={10000}
                  required
                />

                <div className="editor-footer">
                  <span>{content.length} / 10,000 characters</span>
                  <div className="form-actions">
                    <button type="button" className="button secondary" onClick={resetForm}>Cancel</button>
                    <button className="button primary" type="submit" disabled={saving}>
                      {saving ? 'Saving…' : editingId === null ? 'Save note →' : 'Save changes →'}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {error && <p className="notice error" role="alert">{error}</p>}
          {message && <p className="notice success" role="status">{message}</p>}

          <section className="notes-section" aria-labelledby="notes-title">
            <div className="notes-toolbar">
              <div>
                <h2 id="notes-title">All notes <span className="count">{visibleCount}</span></h2>
                <p className="section-subtitle">{search ? 'Search results from your collection' : 'Everything you have captured, in one place.'}</p>
              </div>
              <label className="search-box">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.2 4.2" />
                </svg>
                <input
                  aria-label="Search notes"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your notes..."
                />
                {search && (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>
                )}
              </label>
            </div>

            {loading ? (
              <div className="loading-grid" aria-label="Loading notes">
                {[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}
              </div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✎</div>
                <h3>{search ? 'No matching notes' : 'Your first note starts here.'}</h3>
                <p>{search ? 'Try another search term.' : 'Save an idea, a reminder, or something you want to remember.'}</p>
                {!search && (
                  <button className="button primary" type="button" onClick={startNewNote}>＋ Create your first note</button>
                )}
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map((note, index) => (
                  <article
                    className={`note-card note-tone-${index % 4}`}
                    key={note.id}
                    ref={(element) => { cardRefs.current[index] = element }}
                    style={{ '--reveal-delay': `${(index % 3) * 75}ms` }}
                  >
                    <div className="card-top">
                      <span className="note-symbol" aria-hidden="true">{['✎', '✦', '◇', '○'][index % 4]}</span>
                      <span className="note-label">NOTE {String(note.id).padStart(2, '0')}</span>
                    </div>
                    <h3>{note.title}</h3>
                    <p className="note-content">{note.content}</p>
                    <div className="card-footer">
                      <time>{note.created_at || 'Recently created'}</time>
                      <div className="card-actions">
                        <button type="button" onClick={() => startEditing(note)}>Edit</button>
                        <button type="button" className="delete-action" onClick={() => deleteNote(note.id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>Made for your next big idea.</span>
            <span>React · Express · SQLite</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
