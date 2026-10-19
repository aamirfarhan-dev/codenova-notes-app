require("dotenv").config();

const express = require("express");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({ message: "CodeNova Notes API is running." });
});

// CREATE a note
app.post("/api/notes", async (req, res, next) => {
    try {
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

        const result = await db.query(
            `INSERT INTO notes (title, content)
             VALUES ($1, $2)
             RETURNING *`,
            [title.trim(), content.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// READ all notes or SEARCH by title/content
app.get("/api/notes", async (req, res, next) => {
    try {
        const search = req.query.search;
        let result;

        if (typeof search === "string" && search.trim()) {
            const term = `%${search.trim()}%`;

            result = await db.query(
                `SELECT * FROM notes
                 WHERE title ILIKE $1 OR content ILIKE $1
                 ORDER BY id DESC`,
                [term]
            );
        } else {
            result = await db.query(
                "SELECT * FROM notes ORDER BY id DESC"
            );
        }

        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// UPDATE a note
app.put("/api/notes/:id", async (req, res, next) => {
    try {
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

        const result = await db.query(
            `UPDATE notes
             SET title = $1, content = $2
             WHERE id = $3
             RETURNING *`,
            [title.trim(), content.trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Note not found." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE a note
app.delete("/api/notes/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid note ID." });
        }

        const result = await db.query(
            "DELETE FROM notes WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Note not found." });
        }

        res.json({ message: "Note deleted successfully." });
    } catch (err) {
        next(err);
    }
});

// Handle invalid JSON and unexpected errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Invalid JSON body." });
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
    console.log(`Notes API listening on port ${PORT}`);
});
