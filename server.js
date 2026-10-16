const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("notes.db");
const PORT = 3000;

app.use(express.json());

// CREATE a note
app.post("/api/notes", (req, res) => {
    const { title, content } = req.body;

    if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        !title.trim() ||
        !content.trim()
    ) {
        return res.status(400).json({
            error: "Title and content are required."
        });
    }

    const result = db.prepare(`
        INSERT INTO notes (title, content)
        VALUES (?, ?)
    `).run(title.trim(), content.trim());

    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(note);
});

// READ all notes, or SEARCH by title/content
app.get("/api/notes", (req, res) => {
    const search = req.query.search;

    let notes;

    if (typeof search === "string" && search.trim()) {
        notes = db.prepare(`
            SELECT * FROM notes
            WHERE title LIKE ? OR content LIKE ?
            ORDER BY id DESC
        `).all(`%${search.trim()}%`, `%${search.trim()}%`);
    } else {
        notes = db.prepare(`
            SELECT * FROM notes
            ORDER BY id DESC
        `).all();
    }

    res.json(notes);
});

// UPDATE a note
app.put("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    const { title, content } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid note ID." });
    }

    if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        !title.trim() ||
        !content.trim()
    ) {
        return res.status(400).json({
            error: "Title and content are required."
        });
    }

    const result = db.prepare(`
        UPDATE notes
        SET title = ?, content = ?
        WHERE id = ?
    `).run(title.trim(), content.trim(), id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Note not found." });
    }

    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(id);

    res.json(note);
});

// DELETE a note
app.delete("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid note ID." });
    }

    const result = db.prepare(`
        DELETE FROM notes WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Note not found." });
    }

    res.json({ message: "Note deleted successfully." });
});

// Handle invalid JSON and other unexpected errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Invalid JSON body." });
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
    console.log(`Notes API running at http://localhost:${PORT}`);
});