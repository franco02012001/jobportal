## Job Portal
A full-stack job portal system that allows companies to post jobs and manage applicants while enabling job seekers to search, apply, and track opportunities.

### Prerequisites
- **Node.js**: v18+ recommended
- **Git**

### 1. Clone the repository
```bash
git clone https://github.com/franco02012001/jobportal.git
cd jobportal
```

### 2. Backend setup
```bash
cd backend
npm install
```

- **Create `.env` file** in `backend` (same folder as `package.json`) with values similar to:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

- **Run backend (dev mode)**:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3001` (or the `PORT` you set).

### 3. Frontend setup
Open a new terminal window/tab, then:

```bash
cd jobportal/frontend
npm install
```

- **Run frontend (dev mode)**:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

### 4. Access the app
- **Frontend**: `http://localhost:3000`
- **API**: `http://localhost:3001` (or your configured port)

Make sure the backend is running before using the frontend.
