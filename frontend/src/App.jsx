
import { useEffect, useState, useRef } from "react";
import "./App.css";
import Login from "./Login";
import "./App.css";
import ExcelJS from "exceljs";
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
  ["country", "Country"],
  ["state", "State"],
  ["city", "City"],
  ["skills", "Skills"],
];

const requiredFields = [
  "loginName",
  "firstName",
  "lastName",
  "mobileNumber",
  "emailAddress",
];


const COUNTRIES_API_URL =
    "https://countriesnow.space/api/v0.1";

async function fetchCountriesNow(endpoint, options = {}) {
    const response = await fetch(
        `${COUNTRIES_API_URL}${endpoint}`,
        options
    );

    if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
        throw new Error(result.msg || "Could not load location data.");
    }

    return result.data;
}

// Convert API results into the format used by your dropdowns
function normalizeLocationItems(items) {
    return (items || [])
        .map((item) => {
            const name =
                typeof item === "string"
                    ? item
                    : item?.name || item?.country || "";

            if (!name) return null;

            return {
                id: item?.iso2 || item?.Iso2 || item?.id || name,
                name
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
}



function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("employees");
  const [dashboardCardFilter, setDashboardCardFilter] = useState("all");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // Sorting configuration
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc"
  });
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

  // Unique department count after filters
  const filteredDepartmentCount = new Set(
    displayedEmployees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ).size;

  // Unique designation count after filters
  const filteredDesignationCount = new Set(
    displayedEmployees
      .map((employee) => employee.designation?.trim())
      .filter(Boolean)
  ).size;

  // Filter employees based on the selected Dashboard card
  const dashboardFilteredEmployees =
    activePage === "dashboard"
      ? displayedEmployees.filter((employee) => {
        if (dashboardCardFilter === "active") {
          return employee.status === "Active";
        }

        return true;
      })
      : displayedEmployees;

  // Sort employees before pagination
  const sortedEmployees = [...dashboardFilteredEmployees].sort((a, b) => {

    const key = sortConfig.key;

    const valueA = a[key];
    const valueB = b[key];

    let comparison;

    // Numeric sorting for Employee ID
    if (key === "id") {
      comparison = Number(valueA) - Number(valueB);
    } else {
      // Alphabetical sorting for names and other columns
      comparison = String(valueA ?? "").localeCompare(
        String(valueB ?? ""),
        undefined,
        {
          sensitivity: "base",
          numeric: true
        }
      );
    }

    return sortConfig.direction === "asc"
      ? comparison
      : -comparison;
  });


  const totalPages = Math.max(
    1,
    Math.ceil(dashboardFilteredEmployees.length / pageSize)
  );

  const paginatedEmployees = sortedEmployees.slice(
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
    // Clear authentication
    initialTokenRef.current = null;
    setAuth(null);

    // Clear employee data
    setEmployees([]);

    // Reset employee form
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowEmployeeForm(false);

    // Clear search and filters
    setSearchTerm("");
    setDepartmentFilter("All");
    setStatusFilter("All");

    // Reset sorting to default: latest employee first
    setSortConfig({
        key: "id",
        direction: "desc"
    });

    // Reset pagination
    setCurrentPage(1);
    setPageSize(5);

    // Reset Dashboard card selection
    setDashboardCardFilter("all");

    // Clear master-data dropdown values
    setDepartmentOptions([]);
    setDesignationOptions([]);
    setCountryOptions([]);
    setStateOptions([]);
    setCityOptions([]);

    // Reset navigation and messages
    setActivePage("dashboard");
    setSidebarOpen(false);
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

    setForm((previous) => {
      if (name === "country") {
        return {
          ...previous,
          country: value,
          state: "",
          city: ""
        };
      }

      if (name === "state") {
        return {
          ...previous,
          state: value,
          city: ""
        };
      }

      return {
        ...previous,
        [name]: value
      };
    });
  }

  // Handle column sorting
  function handleSort(key) {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "desc"
          ? "asc"
          : "desc"
    }));
  }

function handleDashboardCardClick(cardType) {
    // Clicking the selected card again clears its selection
    const newCardType =
        dashboardCardFilter === cardType ? "all" : cardType;

    setDashboardCardFilter(newCardType);

    setActivePage("dashboard");
    setShowEmployeeForm(false);

    // Reset filters when selecting a new card
    setSearchTerm("");
    setDepartmentFilter("All");
    setStatusFilter("All");

    setCurrentPage(1);

    if (newCardType === "all" || newCardType === "active") {
        setSortConfig({
            key: "id",
            direction: "desc"
        });
    } else if (newCardType === "departments") {
        setSortConfig({
            key: "department",
            direction: "asc"
        });
    } else if (newCardType === "designations") {
        setSortConfig({
            key: "designation",
            direction: "asc"
        });
    }
}

  // Display sorting arrow in table headings
  function renderSortHeader(label, key) {
    return (
      <th
        onClick={() => handleSort(key)}
        style={{
          cursor: "pointer",
          userSelect: "none"
        }}
        title={`Sort by ${label}`}
      >
        {label}{" "}

        {sortConfig.key === key
          ? sortConfig.direction === "asc"
            ? "▲"
            : "▼"
          : "↕"}
      </th>
    );
  }

  function handleClearForm() {
    setForm({ ...emptyForm });
    setMessage("");
    setError("");
  }

  function validateForm() {
    const required = [...requiredFields];

    // Password is required only when creating an employee
    if (editingId === null) {
      required.push("password");
    }

    for (const field of required) {
      if (!form[field]?.trim()) {
        return `${field} is required.`;
      }
    }

    if (!/^[0-9]{10}$/.test(form.mobileNumber)) {
      return "Mobile number must contain exactly 10 digits.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)
    ) {
      return "Enter a valid email address.";
    }

    if (
      editingId === null &&
      (
        form.password.length < 8 ||
        form.password.length > 100 ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])\S+$/.test(form.password)
      )
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
    setActivePage("employees");
    setShowEmployeeForm(true);

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


async function handleExportExcel() {
    if (sortedEmployees.length === 0) {
        setError("No employee records available to export.");
        return;
    }

    try {
        setError("");
        setMessage("");

        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet("Employees");

        // Define Excel columns
        worksheet.columns = [
            { header: "Employee ID", key: "id", width: 12 },
            { header: "Login Name", key: "loginName", width: 18 },
            { header: "First Name", key: "firstName", width: 18 },
            { header: "Last Name", key: "lastName", width: 18 },
            { header: "Email Address", key: "emailAddress", width: 28 },
            { header: "Mobile Number", key: "mobileNumber", width: 16 },
            { header: "Department", key: "department", width: 18 },
            { header: "Designation", key: "designation", width: 25 },
            { header: "City", key: "city", width: 18 },
            { header: "State", key: "state", width: 18 },
            { header: "Country", key: "country", width: 18 },
            { header: "Status", key: "status", width: 12 },
            { header: "Skills", key: "skills", width: 30 }
        ];

        // Add employee records
        worksheet.addRows(
            sortedEmployees.map((employee) => ({
                id: employee.id,
                loginName: employee.loginName,
                firstName: employee.firstName,
                lastName: employee.lastName,
                emailAddress: employee.emailAddress,
                mobileNumber: employee.mobileNumber,
                department: employee.department,
                designation: employee.designation,
                city: employee.city,
                state: employee.state,
                country: employee.country,
                status: employee.status,
                skills: employee.skills
            }))
        );

        // Format heading row
        worksheet.getRow(1).font = {
            bold: true
        };

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        const today = new Date().toISOString().split("T")[0];

        link.download = `Employee_Management_${today}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        setMessage("Employee data exported successfully!");

    } catch (err) {
        console.error("Excel export error:", err);
        setError("Could not export employee data.");
    }
}

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowEmployeeForm(false);
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
      setShowEmployeeForm(false);
      await loadEmployees();
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
    if (!auth) return;

    async function loadMasterData() {
        try {
            const [departments, designations] =
                await Promise.all([
                    apiRequest("/masterdata/departments"),
                    apiRequest("/masterdata/designations")
                ]);

            setDepartmentOptions(departments);
            setDesignationOptions(designations);

        } catch (err) {
            setError(
                err.message || "Could not load department and designation data."
            );
        }
    }

    loadMasterData();
}, [auth]);




useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
        try {
            const data = await fetchCountriesNow("/countries/iso");

            if (!cancelled) {
                setCountryOptions(normalizeLocationItems(data));
            }
        } catch (err) {
            if (!cancelled) {
                setError(err.message || "Could not load countries.");
            }
        }
    }

    loadCountries();

    return () => {
        cancelled = true;
    };
}, []);

  useEffect(() => {
    if (!form.country) {
      setStateOptions([]);
      return;
    }

    let cancelled = false;

    async function loadStates() {
      try {
        setStateOptions([]);
        setCityOptions([]);

        const data = await fetchCountriesNow(
          `/countries/states/q?country=${encodeURIComponent(form.country)}`
        );
        const states = data.states || [];

        if (!cancelled) {
          setStateOptions(normalizeLocationItems(states));
        }
      } catch (err) {
        console.error("States API error:", err);

        if (!cancelled) {
          setStateOptions([]);
          setError(err.message || "Could not load states.");
        }
      }
    }

    loadStates();

    return () => {
      cancelled = true;
    };
  }, [form.country]);


  useEffect(() => {
    if (!form.country || !form.state) {
      setCityOptions([]);
      return;
    }

    let cancelled = false;

    async function loadCities() {
      try {
        setCityOptions([]);

        const data = await fetchCountriesNow(
          "/countries/state/cities",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              country: form.country,
              state: form.state
            })
          }
        );

        if (!cancelled) {
          setCityOptions(normalizeLocationItems(data));
        }
      } catch (err) {
        console.error("Cities API error:", err);

        if (!cancelled) {
          setCityOptions([]);
          setError(err.message || "Could not load cities.");
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, [form.country, form.state]);



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
          className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => {
            setActivePage("dashboard");
            setShowEmployeeForm(false);
            setSidebarOpen(false);
          }}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className={`nav-link ${activePage === "employees" ? "active" : ""
            }`}
          onClick={() => {
            setActivePage("employees");
            setShowEmployeeForm(false);
            setSidebarOpen(false);
          }}
        >
          <span>＋</span> Employee Management
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

              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#66748a" }}>
             
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
          {activePage === "dashboard" && (
            <>
              <h1 className="page-heading">Employee Management</h1>
           

              <div className="stats-grid">
                <div
                  className="stat-card"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDashboardCardClick("all")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDashboardCardClick("all");
                    }
                  }}
                >
                  <div className="stat-icon blue">👥</div>
                  <div>
                    <p className="stat-label">Total Employees</p>
                    <h2 className="stat-value">{totalEmployees}</h2>
                    <p className="stat-caption">All employee records</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDashboardCardClick("active")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDashboardCardClick("active");
                    }
                  }}
                >
                  <div className="stat-icon green">✓</div>
                  <div>
                    <p className="stat-label">Active Employees</p>
                    <h2 className="stat-value">{activeEmployees}</h2>
                    <p className="stat-caption">Currently active</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDashboardCardClick("departments")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDashboardCardClick("departments");
                    }
                  }}
                >
                  <div className="stat-icon purple">▦</div>
                  <div>
                    <p className="stat-label">Departments</p>
                    <h2 className="stat-value">{totalDepartments}</h2>
                    <p className="stat-caption">Unique departments</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDashboardCardClick("designations")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDashboardCardClick("designations");
                    }
                  }}
                >
                  <div className="stat-icon orange">▣</div>
                  <div>
                    <p className="stat-label">Designations</p>
                    <h2 className="stat-value">{totalDesignations}</h2>
                    <p className="stat-caption">Unique designations</p>
                  </div>
                </div>
                </div>
            </>
          )}

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

              {showEmployeeForm && (
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
                          <span>
                            {label}
                            {(requiredFields.includes(name) ||
                              (name === "password" && editingId === null)) && (
                                <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                              )}
                          </span>
                          {["department", "designation", "country", "state", "city"].includes(
                            name
                          ) ? (
                            <select
                              style={{
                                width: "100%",
                                padding: "11px",
                                border: "1px solid #d7dfeb",
                                borderRadius: "7px",
                                background: "#fff",
                              }}
                              name={name}
                              value={form[name]}
                              onChange={handleChange}
                            >
                              <option value="">Select {label}</option>
                              {(name === "department"
                                ? departmentOptions
                                : name === "designation"
                                  ? designationOptions
                                  : name === "country"
                                    ? countryOptions
                                    : name === "state"
                                      ? stateOptions
                                      : cityOptions
                              ).map((item) => (
                                <option key={item.id} value={item.name}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          ) : (
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
                              required={
                                requiredFields.includes(name) ||
                                (name === "password" && editingId === null)
                              }
                              disabled={name === "password" && editingId !== null}
                              maxLength={
                                ["loginName", "firstName", "lastName"].includes(name)
                                  ? 50
                                  : name === "emailAddress"
                                    ? 100
                                    : undefined
                              }
                            />
                          )}
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
                            : "Submit"}
                      </button>

                      <button
                        type="button"
                        className="clear-button"
                        onClick={handleClearForm}
                        disabled={loading}
                      >
                        Clear
                      </button>

                      {/* <button
                    className="secondary-button"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button> */}
                    </div>
                  </form>
                </section>
              )}

              {(activePage === "dashboard" || activePage === "employees") &&
                !showEmployeeForm && (
                  <section id="employee-list" className="panel">

                    <div
                      className="employee-search"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        width: "100%",
                        marginBottom: "20px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                          flex: "1"
                        }}
                      >
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

                      {activePage === "dashboard" && (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={handleExportExcel}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            whiteSpace: "nowrap"
                          }}
                        >
                         
                          Export
                        </button>
                      )}
                    </div>

                    <div className="employee-filters">
                      <label>

                        <select
                          value={departmentFilter}
                          onChange={(event) => setDepartmentFilter(event.target.value)}
                        >
                          <option value="All"> Department</option>
                          {departments.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>

                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                        >
                          <option value="All"> Status</option>
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
                      <h2 style={{ margin: 0 }}>
                        {activePage === "dashboard" ? (
                          <>
                            {dashboardCardFilter === "active"
                              ? "Active Employees"
                              : dashboardCardFilter === "departments"
                              ? "Departments"
                              : dashboardCardFilter === "designations"
                              ? "Designations"
                              : "All Employees"}
                            {" ("}
                            {dashboardCardFilter === "departments"
                              ? filteredDepartmentCount
                              : dashboardCardFilter === "designations"
                              ? filteredDesignationCount
                              : dashboardFilteredEmployees.length}
                            {")"}
                          </>
                        ) : (
                          <>Employees ({displayedEmployees.length})</>
                        )}
                      </h2>

                      {activePage === "employees" && (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => {
                            setEditingId(null);
                            setForm(emptyForm);
                            setMessage("");
                            setError("");
                            setShowEmployeeForm(true);
                          }}
                        >
                          Add Employee
                        </button>
                      )}
                    </div>

                    <div className="table-container">
                      <table className="employee-table">
                        <thead>
                          <tr>
                            {activePage === "dashboard" ? (
                              <>
                                {renderSortHeader("ID", "id")}
                                {renderSortHeader("Login Name", "loginName")}
                                {renderSortHeader("First Name", "firstName")}
                                {renderSortHeader("Last Name", "lastName")}
                                {renderSortHeader("Email", "emailAddress")}
                                {renderSortHeader("Mobile", "mobileNumber")}
                                {renderSortHeader("Department", "department")}
                                {renderSortHeader("Designation", "designation")}
                                {renderSortHeader("City", "city")}
                                {renderSortHeader("State", "state")}
                                {renderSortHeader("Country", "country")}
                                {renderSortHeader("Status", "status")}
                              </>
                            ) : (
                              <>
                                {renderSortHeader("ID", "id")}
                                {renderSortHeader("Employee", "firstName")}
                                {renderSortHeader("Email", "emailAddress")}
                                {renderSortHeader("Mobile", "mobileNumber")}
                                {renderSortHeader("Department", "department")}
                                {renderSortHeader("Designation", "designation")}
                                {renderSortHeader("Status", "status")}
                                <th>Actions</th>
                              </>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedEmployees.map((employee) => (
                            <tr key={employee.id}>
                              {activePage === "dashboard" ? (
                                <>
                                  <td>{employee.id}</td>
                                  <td>{employee.loginName}</td>
                                  <td>{employee.firstName}</td>
                                  <td>{employee.lastName}</td>
                                  <td>{employee.emailAddress}</td>
                                  <td>{employee.mobileNumber}</td>
                                  <td>{employee.department}</td>
                                  <td>{employee.designation}</td>
                                  <td>{employee.country}</td>
                                  <td>{employee.state}</td>
                                  <td>{employee.city}</td>


                                  <td>
                                    <span
                                      className={`status-badge ${employee.status === "Inactive" ? "inactive" : ""}`}
                                    >
                                      {employee.status}
                                    </span>
                                  </td>
                                </>
                              ) : (
                                <>
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
                                      className={`status-badge ${employee.status === "Inactive" ? "inactive" : ""}`}
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
                                </>
                              )}
                            </tr>
                          ))}

                          {dashboardFilteredEmployees.length === 0 && (
                            <tr>
                              <td
                                colSpan={activePage === "employees" ? 8 : 12}
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
                        {dashboardFilteredEmployees.length === 0
                          ? 0
                          : (currentPage - 1) * pageSize + 1}
                        {"–"}
                        {Math.min(
                          currentPage * pageSize,
                          dashboardFilteredEmployees.length,
                        )}
                        {" of "}
                        {dashboardFilteredEmployees.length} employees
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
                )}
            </main>
      </div>
    </div>
  );
}

export default App;
