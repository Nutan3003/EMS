# Employee Management System (EMS)

A full-stack Employee Management System built using React.js, ASP.NET Core Web API, and MySQL. The application supports employee CRUD operations, authentication, server-side validation, search, filtering, and pagination.

## 1. Technology Stack

- **Frontend:** React.js, Vite, CSS
- **Backend:** ASP.NET Core Web API, C#
- **Database:** MySQL
- **Authentication:** JWT Bearer Authentication
- **Password Security:** BCrypt password hashing
- **API Testing:** Postman
- **Database Tools:** MySQL Workbench

## 2. Features

### Authentication and Security
- Login and logout functionality
- BCrypt password hashing
- JWT-protected employee APIs
- Single-use access tokens with server-side replay prevention
- Unauthorized requests rejected
- Password hashes excluded from API responses

### Employee Management
- Create, read, update, and delete employees
- Duplicate login name and email validation
- Employee details and status management
- Active and Inactive employee statuses

### Dashboard and Usability
- Employee statistics dashboard
- Search by employee name, login name, and email
- Filter by department and status
- Pagination with 5, 10, and 20 rows per page
- Responsive layout for desktop and mobile
- Form validation and success/error messages

## 3. Prerequisites

Install the following software:

- Node.js and npm
- .NET SDK compatible with the backend project's target framework
- MySQL Server
- MySQL Workbench (optional)
- Git (optional)

## 4. Project Structure

```text
EmployeeManagementSystem/
├── backend/
│   └── EmployeeManagement.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── DTOs/
│       ├── Program.cs
│       └── EmployeeManagement.Api.csproj
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── package.json
│   └── index.html
└── README.md
```

*Folder names may differ depending on the final project structure.*

## 5. Database Setup

1. Start your MySQL Server.
2. Open MySQL Workbench.
3. Create the database:

```sql
CREATE DATABASE employee_management;
```

4. Configure the database connection string for the backend.
5. Apply the Entity Framework Core migrations, if migrations are included in the project.

Example migration commands, run from the backend project directory:

```powershell
dotnet ef database update
```

If the Entity Framework CLI is not installed, install it first:

```powershell
dotnet tool install --global dotnet-ef
```

If it is already installed, update it only if required.

Verify the database and tables:

```sql
USE employee_management;
SHOW TABLES;
```

The database configuration must match the connection string expected by the application. Do not commit database passwords or other secrets to source control.

## 6. Backend Setup

Open PowerShell:

```powershell
cd D:\Assignments\EmployeeManagementSystem\backend\EmployeeManagement.Api
```

Restore dependencies:

```powershell
dotnet restore
```

Build the project:

```powershell
dotnet build
```

Configure the database connection and JWT settings using the configuration mechanism expected by the backend, such as .NET User Secrets.

Run the backend:

```powershell
dotnet run
```

The development API URLs used in this project are:

- HTTPS: `https://localhost:7201`
- HTTP: `http://localhost:5118`

The actual URLs depend on the backend launch settings.

## 7. Frontend Setup

Open a separate PowerShell terminal:

```powershell
cd D:\Assignments\EmployeeManagementSystem\frontend
```

Install dependencies:

```powershell
npm install
```

Build the frontend:

```powershell
npm run build
```

Start the development server:

```powershell
npm run dev
```

Open the URL displayed in the terminal, normally:

`http://localhost:5173`

Ensure the backend is running and the frontend API URL matches the backend address.

## 8. API Endpoints

The following endpoints are implemented in the application:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate an employee |
| POST | `/api/employees` | Create an employee |
| GET | `/api/employees` | Retrieve employees |
| GET | `/api/employees/{id}` | Retrieve one employee |
| PUT | `/api/employees/{id}` | Update an employee |
| DELETE | `/api/employees/{id}` | Delete an employee |

Employee endpoints require valid bearer-token authentication. Use a newly issued token for each protected request because tokens are configured for single use.

## 9. Validation and Security

- Passwords are hashed using BCrypt before storage.
- Password hashes are excluded from API responses.
- Required fields and email/mobile number formats are validated.
- Duplicate login names and email addresses are rejected.
- Invalid employee status values are rejected.
- Protected APIs reject missing or invalid tokens.
- Replayed single-use tokens are rejected.
- Database and JWT secrets should be configured outside committed source files.

**Security note:** The current frontend retains login credentials in memory to obtain fresh single-use tokens. This is an assignment-specific design and should be replaced with a stronger session or token-renewal architecture for production use.

## 10. Testing

Verify the following before submission:

- Successful and unsuccessful login
- Logout behavior
- Employee creation, retrieval, update, and deletion
- Duplicate employee rejection
- Required-field and format validation
- Missing-token rejection (`401 Unauthorized`)
- Reused-token rejection (`401 Unauthorized`)
- Password hash exclusion from API responses
- Search, filters, and pagination
- Responsive dashboard behavior
- Successful frontend and backend builds

## 11. Troubleshooting

- **Database connection failure:** Check that MySQL is running and the connection string is correct.
- **JWT key missing:** Verify the JWT settings configured for the backend.
- **CORS error:** Check the configured frontend origin in the backend.
- **401 Unauthorized:** Sign in again and use a fresh token.
- **Frontend cannot reach the API:** Confirm the backend is running at the configured URL.
- **Migration error:** Check the .NET SDK, Entity Framework Core and database provider package versions for compatibility.

## 12. License

This project was developed as an Employee Management System assignment.
