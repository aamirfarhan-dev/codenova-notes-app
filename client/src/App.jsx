import { useEffect, useState } from 'react'
import './App.css'

const API = '/api/notes'

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

  function resetForm() {
    setTitle('')
    setContent('')
    setEditingId(null)
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">N</span>
          <span>noted<span className="brand-dot">.</span></span>
        </a>
        <span className="status"><span className="status-dot" /> Personal workspace</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR SPACE, YOUR THOUGHTS</p>
        <h1>Make room for<br /><span>good ideas.</span></h1>
        <p className="hero-copy">
          Capture what matters. Keep your thoughts organized and easy to find.
        </p>
      </section>

      <section className="workspace">
        <form className="note-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">{editingId === null ? 'NEW NOTE' : 'EDITING NOTE'}</p>
              <h2>{editingId === null ? 'What’s on your mind?' : 'Update your note'}</h2>
            </div>
            <span className="form-icon">✎</span>
          </div>

          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your note a title..."
            maxLength={120}
            required
          />

          <label htmlFor="content">Your thoughts</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing here..."
            rows={5}
            maxLength={10000}
            required
          />

          <div className="form-footer">
            <span>{content.length} characters</span>
            <div className="form-actions">
              {editingId !== null && (
                <button type="button" className="button secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId === null ? '+ Save note' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>

        {error && <p className="notice error" role="alert">{error}</p>}
        {message && <p className="notice success" role="status">{message}</p>}

        <section className="notes-section">
          <div className="notes-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h2>All notes <span className="count">{notes.length}</span></h2>
            </div>
            <div className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search notes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your notes..."
              />
              {search && (
                <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading your notes…</div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✎</div>
              <h3>{search ? 'No matching notes' : 'A fresh page.'}</h3>
              <p>{search ? 'Try another search term.' : 'Your ideas deserve a place. Create your first note above.'}</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note, index) => (
                <article className={`note-card card-${index % 3}`} key={note.id}>
                  <div className="card-top">
                    <span className="note-label">NOTE {String(note.id).padStart(2, '0')}</span>
                    <span className="card-pin" aria-hidden="true">✳</span>
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
      </section>

      <footer className="page-footer">
        <span>NOTED. — A LITTLE SPACE FOR BIG IDEAS</span>
        <span>Built with React · Express · SQLite</span>
      </footer>
    </main>
  )
}

export default App