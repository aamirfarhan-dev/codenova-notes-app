# \# CodeNova Notes App

# 

# A full-stack notes application built with React, Node.js, Express, and SQLite. Create, view, search, edit, and delete notes through a simple web interface.

# 

# \## Features

# 

# \- Create notes with a title and content

# \- View saved notes

# \- Search notes

# \- Edit existing notes

# \- Delete notes

# \- Persist notes using SQLite

# \- Validate note input through the API

# 

# \## Tech Stack

# 

# \*\*Frontend:\*\* React, Vite, CSS  

# \*\*Backend:\*\* Node.js, Express  

# \*\*Database:\*\* SQLite using better-sqlite3

# 

# \## Prerequisites

# 

# \- Node.js and npm

# \- Git (optional)

# 

# \## Installation and Setup

# 

# 1\. Clone the repository:

# 

# &#x20;  ```bash

# &#x20;  git clone https://github.com/aamirfarhan-dev/codenova-notes-app.git

# &#x20;  cd codenova-notes-app

# &#x20;  ```

# 

# 2\. Install backend dependencies:

# 

# &#x20;  ```bash

# &#x20;  npm install

# &#x20;  ```

# 

# 3\. Install frontend dependencies:

# 

# &#x20;  ```bash

# &#x20;  cd client

# &#x20;  npm install

# &#x20;  ```

# 

# \## Running the Application

# 

# Open two terminals from the project directory.

# 

# \*\*Terminal 1 — Backend\*\*

# 

# ```bash

# node server.js

# ```

# 

# \*\*Terminal 2 — Frontend\*\*

# 

# ```bash

# cd client

# npm run dev

# ```

# 

# Open the local URL printed by Vite in your browser.

# 

# \## API Endpoints

# 

# | Method | Endpoint | Purpose |

# |---|---|---|

# | GET | `/api/notes` | Retrieve notes |

# | POST | `/api/notes` | Create a note |

# | PUT | `/api/notes/:id` | Update a note |

# | DELETE | `/api/notes/:id` | Delete a note |

# 

# The API also supports searching notes if a search query is provided.

# 

# \## Production Build

# 

# From the project root:

# 

# ```bash

# cd client

# npm run build

# ```

# 

# \## Project Structure

# 

# ```text

# notes-app/

# ├── client/       # React frontend

# ├── db.js         # SQLite database setup

# ├── server.js     # Express API server

# ├── app.js        # Application entry/helper file

# ├── package.json  # Backend dependencies

# └── README.md     # Project documentation

# ```

# 

# \## Learning Outcomes

# 

# \- Building a REST API with Express

# \- Implementing CRUD operations

# \- Persisting data using SQLite

# \- Connecting a React frontend to a backend API

# \- Using Git and GitHub for version control



