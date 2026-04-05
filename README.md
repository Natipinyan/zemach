# Zemach Server

A server-side application designed to process, manage, and store data, primarily interfacing with Arduino hardware systems.

🌐 Overview

This project focuses strictly on the backend architecture:
* **Server Side (Backend)** – Developed with Node.js and Express to handle routing, middleware, and core application logic.
* **Database Integration** – Utilizes a SQL database (defined via `arduino.sql`) for persistent storage of hardware-generated data.
* **View Rendering** – Implements EJS as a template engine for basic server-side rendering of the user interface.
  The system is structured to provide endpoints for data ingestion, process parameters, and serve administrative views.

🧩 Features

* **API Routing** for structured data transmission and endpoint management.
* **Database Schema** tailored for Arduino data logging and retrieval.
* **Custom Middleware** for request handling and processing.
* **Server-Side Rendered Interfaces** using EJS for direct backend-to-view communication.
* **Parameter Configuration** via dedicated modules (`gen_params.js`).

💻 Tech Stack

**Backend**
* Node.js
* Express.js
* SQL (Relational Database)
* EJS (Embedded JavaScript templating)