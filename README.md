# 🚀 Catalyst - Project Management System

A modern, multi-tenant project management tool built with Django + GraphQL backend and React + TypeScript frontend.




## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Django)      │◄──►│  (PostgreSQL)   │
│   React + TS    │    │   GraphQL       │    │                 │
│   Apollo Client │    │   Multi-tenant  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd catalyst-project-management

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/graphql
# Database: localhost:5432
```

### Option 2: Local Development

#### Backend Setup

```bash
cd main-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgres://username:password@localhost:5432/catalyst_db"
export SECRET_KEY="your-secret-key-here"
export DEBUG=True

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL="http://localhost:8000/graphql"

# Start the development server
npm run dev
```

## 📚 API Documentation

### GraphQL Endpoint

```
POST http://localhost:8000/graphql/
```

### Authentication

All API requests require an `X-API-Key` header with your organization's API key.

### Key Queries

#### Get Projects

```graphql
query GetProjects {
  allProjects {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTasks
  }
}
```

#### Get Tasks

```graphql
query GetTasks($projectId: String!) {
  allTasks(projectId: $projectId) {
    id
    title
    description
    status
    assigneeEmail
    dueDate
  }
}
```

### Key Mutations

#### Create Project

```graphql
mutation CreateProject($name: String!, $description: String) {
  createProject(name: $name, description: $description) {
    project {
      id
      name
      description
      status
    }
  }
}
```

#### Create Task

```graphql
mutation CreateTask(
  $projectId: String!
  $title: String!
  $description: String
) {
  createTask(projectId: $projectId, title: $title, description: $description) {
    task {
      id
      title
      description
      status
    }
  }
}
```

## 🧪 Testing

### Backend Tests

```bash
cd main-api
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Run All Tests

```bash
# This will run the CI/CD pipeline locally
./scripts/run-tests.sh
```

## 🐳 Docker Commands

### Build Images

```bash
# Build backend
docker build -t catalyst-backend ./main-api

# Build frontend
docker build -t catalyst-frontend ./frontend
```

### Run Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 🔧 Development

### Project Structure

```
catalyst-project-management/
├── .github/workflows/     # CI/CD pipelines
├── main-api/             # Django backend
│   ├── projects/         # Main app
│   ├── backend/          # Django settings
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend
│   ├── src/              # Source code
│   ├── components/       # React components
│   └── package.json      # Node dependencies
├── docker-compose.yml    # Development environment
└── README.md            # This file
```

## 🚀 Deployment

### Production Environment Variables

```bash
# Backend
DATABASE_URL=postgres://user:pass@host:5432/db
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://your-api-domain.com/graphql
```

### Deployment Commands

```bash
# Backend
docker build -t catalyst-backend:prod ./main-api
docker run -p 8000:8000 catalyst-backend:prod

# Frontend
docker build -t catalyst-frontend:prod ./frontend
docker run -p 3000:3000 catalyst-frontend:prod
```
