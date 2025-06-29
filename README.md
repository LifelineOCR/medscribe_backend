# MedScribe API

MedScribe is a secure RESTful API built with **Express.js** and **MongoDB**, designed to allow users to upload handwritten medical documents, transcribe them using an AI service (e.g., LLaMA 4), and manage patient and transcription records efficiently.

## 🌟 Features

- **User Authentication** with JWT and blacklisting
- **Patient Management** (CRUD operations)
- **Medical Document Upload** via `multer`
- **Document Transcription** using an external LLaMA-based AI service
- **Activity Logging** via Winston
- **Swagger Documentation** for API usage
- **Clean architecture**: Modular controllers, middleware, models, and utils

---

## 📦 Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Swagger UI** for API documentation
- **Winston** for logging
- **Dotenv** for environment config

---

## 📂 Project Structure

![alt text](image-1.png)

---

## 🔐 Authentication

- All protected routes require a valid **JWT** token passed in the `Authorization` header as `Bearer <token>`.
- JWTs are blacklisted upon logout to prevent reuse.

---

## 📑 API Documentation

Swagger UI is available at:
`http://localhost:<PORT>/api-docs`

![alt text](image.png)


## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/medscribe-api.git
cd medscribe-api
npm install

```

## Available Endpoints
### Authentication

| Method | Endpoint          | Description                 |
| :----- | :---------------- | :-------------------------- |
| `POST` | `/auth/register`  | Register a new user         |
| `POST` | `/auth/login`     | Login and get token         |
| `POST` | `/auth/logout`    | Logout and blacklist token  |

### Patients

| Method   | Endpoint          | Description                      |
| :------- | :---------------- | :------------------------------- |
| `POST`   | `/api/patients`   | Create a new patient             |
| `GET`    | `/api/patients`   | List all patients for the user   |
| `GET`    | `/api/patients/:id`| Get a patient by ID              |
| `PUT`    | `/api/patients/:id`| Update a patient                 |
| `DELETE` | `/api/patients/:id`| Delete a patient                 |

### Documents

| Method   | Endpoint                          | Description                        |
| :------- | :-------------------------------- | :--------------------------------- |
| `POST`   | `/api/documents/upload`           | Upload a document (form-data)      |
| `GET`    | `/api/documents/`                 | List all documents                 |
| `GET`    | `/api/documents/recent`           | Get recent documents               |
| `GET`    | `/api/documents/:id`              | Get a document by ID               |
| `GET`    | `/api/documents/:id/transcription`| Get transcription for a document   |
| `GET`    | `/api/documents/file/:filename`   | Download/view uploaded file        |
| `DELETE` | `/api/documents/`                 | Delete all documents for the user  |