
import { useEffect, useState, useRef } from "react";
import "./App.css";
import Login from "./Login";
import "./App.css";
const API_URL = "https://localhost:7201/api";

const emptyForm = {
  loginName: "",
  password: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  emailAddress: "",
  department: "",
  designation: "",
  status: "Active",
  city: "",
  state: "",
  country: "",
  skills: "",
};

const fields = [
  ["loginName", "Login Name"],
  ["password", "Password"],
  ["firstName", "First Name"],
  ["lastName", "Last Name"],
  ["mobileNumber", "Mobile Number"],
  ["emailAddress", "Email Address"],
  ["department", "Department"],
  ["designation", "Designation"],
  ["city", "City"],
  ["state", "State"],
  ["country", "Country"],
  ["skills", "Skills"],
];

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
const [statusFilter, setStatusFilter] = useState("All");
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(5);
const [auth, setAuth] = useState(null);
const initialTokenRef = useRef(null);



  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const totalDepartments = new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ).size;

  const totalDesignations = new Set(
    employees
      .map((employee) => employee.designation?.trim())
      .filter(Boolean)
  ).size;

  const filteredEmployees = employees.filter((employee) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return true;

    const searchableText = [
      employee.firstName,
      employee.lastName,
      employee.loginName,
      employee.emailAddress,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const departments = [
  ...new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ),
].sort((a, b) => a.localeCompare(b));

const displayedEmployees = filteredEmployees.filter((employee) => {
  const matchesDepartment =
    departmentFilter === "All" ||
    employee.department?.trim() === departmentFilter;

  const matchesStatus =
    statusFilter === "All" || employee.status === statusFilter;

  return matchesDepartment && matchesStatus;
});


const totalPages = Math.max(
  Math.ceil(displayedEmployees.length / pageSize)
);

const paginatedEmployees = displayedEmployees.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

function handleLogin(loginData) {
  initialTokenRef.current = loginData.accessToken;

  setAuth({
    loginName: loginData.loginName,
    password: loginData.password,
    employee: loginData.employee,
  });
}

function handleLogout() {
  initialTokenRef.current = null;
  setAuth(null);
  setEmployees([]);
  setEditingId(null);
  setMessage("");
  setError("");
}

 async function getFreshToken() {
  if (!auth?.loginName || !auth?.password) {
    throw new Error("Please sign in again.");
  }

  // Use the token from the login form once.
  if (initialTokenRef.current) {
    const token = initialTokenRef.current;
    initialTokenRef.current = null;
    return token;
  }

  // Single-use JWT: obtain a fresh token for each later request.
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      loginName: auth.loginName,
      password: auth.password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.accessToken) {
    if (response.status === 401) {
      initialTokenRef.current = null;
      setAuth(null);
    }

    throw new Error(
      data.message || "Authentication failed. Please sign in again."
    );
  }

  return data.accessToken;
}

  async function apiRequest(path, options = {}) {
    const token = await getFreshToken();

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        (data.errors
          ? Object.values(data.errors).flat().join(" ")
          : `Request failed: HTTP ${response.status}`)
      );
    }

    return data;
  }

  async function loadEmployees() {
    setError("");

    try {
      const data = await apiRequest("/employees");
      setEmployees(data);
      setMessage(`${data.length} employee(s) loaded successfully.`);
    } catch (err) {
      setError(err.message || "Could not load employees.");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function validateForm() {
    const requiredValues = Object.entries(form).filter(
      ([name]) => name !== "password" || editingId === null
    );

    if (requiredValues.some(([, value]) => !value.trim())) {
      return "All required fields must be filled in.";
    }

    if (!/^[0-9]{10}$/.test(form.mobileNumber)) {
      return "Mobile number must contain exactly 10 digits.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
      return "Enter a valid email address.";
    }

    if (
      editingId === null &&
      (form.password.length < 8 ||
        form.password.length > 100 ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])\S+$/.test(
          form.password
        ))
    ) {
      return "Password must be 8–100 characters and include uppercase, lowercase, a number, and a special character, without spaces.";
    }

    if (form.loginName.length > 50) {
      return "Login name must be 50 characters or fewer.";
    }

    if (
      form.firstName.length > 50 ||
      form.lastName.length > 50
    ) {
      return "First and last names must be 50 characters or fewer.";
    }

    if (form.emailAddress.length > 100) {
      return "Email address must be 100 characters or fewer.";
    }

    return "";
  }
  function handleEdit(employee) {
    setEditingId(employee.id);

    setForm({
      loginName: employee.loginName ?? "",
      password: "",
      firstName: employee.firstName ?? "",
      lastName: employee.lastName ?? "",
      mobileNumber: employee.mobileNumber ?? "",
      emailAddress: employee.emailAddress ?? "",
      department: employee.department ?? "",
      designation: employee.designation ?? "",
      status: employee.status ?? "Active",
      city: employee.city ?? "",
      state: employee.state ?? "",
      country: employee.country ?? "",
      skills: employee.skills ?? "",
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiRequest(`/employees/${employee.id}`, {
        method: "DELETE",
      });

      setEmployees((previous) =>
        previous.filter((item) => item.id !== employee.id)
      );

      setMessage("Employee deleted successfully.");

      if (editingId === employee.id) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message || "Could not delete employee.");
    }
  }



  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = { ...form };
      delete payload.password;

      if (editingId !== null) {
        await apiRequest(`/employees/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Employee updated successfully.");
      } else {
        await apiRequest("/employees", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMessage("Employee created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadEmployees();

      setMessage("Employee created successfully.");
      setForm(emptyForm);
      await loadEmployees();
      setMessage("Employee created successfully.");
    } catch (err) {
      setError(err.message || "Could not create employee.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth) {
      loadEmployees();
    }
  }, [auth]);

  useEffect(() => {
    function handleKeyboardShortcut(event) {
      // Ctrl + / focuses the first employee form field.
      if (
        event.ctrlKey &&
        event.key === "/" &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();

        document
          .querySelector("#employee-form input:not(:disabled)")
          ?.focus();
      }

      // Escape closes the sidebar or cancels editing.
      if (event.key === "Escape") {
        setSidebarOpen(false);

        if (editingId !== null) {
          cancelEdit();
        }
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [editingId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter, pageSize, employees.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          EMS Portal
          <span>Employee Management System</span>
        </div>

        <span className="nav-label">Workspace</span>

        <button
          className="nav-link active"
          onClick={() => setSidebarOpen(false)}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className="nav-link"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setSidebarOpen(false);
            document.getElementById("employee-form")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          <span>＋</span> Add Employee
        </button>

        <button
          className="nav-link"
          onClick={() => {
            setSidebarOpen(false);
            document.getElementById("employee-list")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          <span>☷</span> Employee List
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>

            <div>
              <div className="topbar-title">Employee Dashboard</div>
              <div className="topbar-subtitle">
                Manage your employees in one place
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#66748a" }}>
              Admin Panel
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="page-content">
          <h1 className="page-heading">Employee Management</h1>
          <p className="page-description">
            Create, view, update, and manage employee records.
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div>
                <p className="stat-label">Total Employees</p>
                <h2 className="stat-value">{totalEmployees}</h2>
                <p className="stat-caption">All employee records</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div>
                <p className="stat-label">Active Employees</p>
                <h2 className="stat-value">{activeEmployees}</h2>
                <p className="stat-caption">Currently active</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">▦</div>
              <div>
                <p className="stat-label">Departments</p>
                <h2 className="stat-value">{totalDepartments}</h2>
                <p className="stat-caption">Unique departments</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">▣</div>
              <div>
                <p className="stat-label">Designations</p>
                <h2 className="stat-value">{totalDesignations}</h2>
                <p className="stat-caption">Unique designations</p>
              </div>
            </div>
          </div>

          {message && (
            <p role="status" style={{ color: "#18844b" }}>
              {message}
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: "#c52c38" }}>
              {error}
            </p>
          )}

          <section id="employee-form" className="panel">
            <h2>{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  gap: "16px",
                }}
              >
                {fields.map(([name, label]) => (
                  <label
                    key={name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                    <input
                      style={{
                        width: "100%",
                        padding: "11px",
                        border: "1px solid #d7dfeb",
                        borderRadius: "7px",
                        background: "#fff",
                      }}
                      name={name}
                      type={
                        name === "password"
                          ? "password"
                          : name === "emailAddress"
                            ? "email"
                            : "text"
                      }
                      value={form[name]}
                      onChange={handleChange}
                      required={name !== "password" || editingId === null}
                      disabled={name === "password" && editingId !== null}
                      maxLength={
                        ["loginName", "firstName", "lastName"].includes(name)
                          ? 50
                          : name === "emailAddress"
                            ? 100
                            : undefined
                      }
                    />
                  </label>
                ))}

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  Status
                  <select
                    style={{
                      width: "100%",
                      padding: "11px",
                      border: "1px solid #d7dfeb",
                      borderRadius: "7px",
                      background: "#fff",
                    }}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Employee"
                      : "Add Employee"}
                </button>

                {editingId !== null && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section id="employee-list" className="panel">

            <div className="employee-search">
              <label htmlFor="employee-search-input">
                Search employees
              </label>

              <input
                id="employee-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, login, or email..."
                aria-label="Search employees by name, login name, or email"
              />

              {searchTerm && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="employee-filters">
              <label>
                Department
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option value="All">All Departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSearchTerm("");
                  setDepartmentFilter("All");
                  setStatusFilter("All");
                }}
              >
                Reset Filters
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <h2 style={{ margin: 0 }}>Employees ({employees.length})</h2>

              <button
                className="secondary-button"
                type="button"
                onClick={loadEmployees}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="table-container">
              <table className="employee-table">
                <thead>
                  <tr>
                    {[
                      "ID",
                      "Employee",
                      "Email",
                      "Mobile",
                      "Department",
                      "Designation",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>
                        <strong>
                          {employee.firstName} {employee.lastName}
                        </strong>
                        <div style={{ color: "#778399", marginTop: "4px" }}>
                          {employee.loginName}
                        </div>
                      </td>
                      <td>{employee.emailAddress}</td>
                      <td>{employee.mobileNumber}</td>
                      <td>{employee.department}</td>
                      <td>{employee.designation}</td>
                      <td>
                        <span
                          className={`status-badge ${employee.status === "Inactive" ? "inactive" : ""
                            }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "7px" }}>
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => handleEdit(employee)}
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => handleDelete(employee)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {displayedEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ textAlign: "center", padding: "28px" }}
                      >
                        {employees.length === 0
                          ? "No employees found. Add your first employee."
                          : "No employees match the current search or filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                Showing{" "}
                {displayedEmployees.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                {"–"}
                {Math.min(currentPage * pageSize, displayedEmployees.length)}
                {" of "}
                {displayedEmployees.length} employees
              </div>

              <div className="pagination-controls">
                <label className="page-size-control">
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                    }}
                    aria-label="Employees per page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>

                <span className="page-number" aria-live="polite">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
