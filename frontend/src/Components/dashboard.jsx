

"use client"

import { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2"
import '../Components/dashboard.css'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS = [
  { id: 1, name: "Admin User", email: "admin@example.com", role: "admin", dataUsage: "1.2GB" },
  { id: 2, name: "John Doe", email: "john@example.com", role: "user", dataUsage: "450MB" },
  { id: 3, name: "Jane Smith", email: "jane@example.com", role: "user", dataUsage: "820MB" },
]

// Mock file history - in a real app, this would come from a backend
const MOCK_HISTORY = [
  { id: 1, fileName: "sales_data_2023.xlsx", uploadDate: "2023-12-15", chartType: "bar", size: "245KB" },
  { id: 2, fileName: "marketing_metrics.xlsx", uploadDate: "2023-12-10", chartType: "line", size: "180KB" },
  { id: 3, fileName: "financial_report.xlsx", uploadDate: "2023-12-05", chartType: "pie", size: "320KB" },
]

// Chart type options
const CHART_TYPES = [
  { id: "bar", name: "Bar Chart", icon: "📊" },
  { id: "line", name: "Line Chart", icon: "📈" },
  { id: "pie", name: "Pie Chart", icon: "🥧" },
  { id: "doughnut", name: "Doughnut Chart", icon: "🍩" },
]

const Dashboard = () => {
  // State management
  const [currentUser, setCurrentUser] = useState({ name: "Admin User", role: "admin" })
  const [activeTab, setActiveTab] = useState("dashboard")
  const [fileData, setFileData] = useState(null)
  const [columns, setColumns] = useState([])
  const [selectedXAxis, setSelectedXAxis] = useState("")
  const [selectedYAxis, setSelectedYAxis] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("bar")
  const [chartData, setChartData] = useState(null)
  const [userHistory, setUserHistory] = useState(MOCK_HISTORY)
  const [users, setUsers] = useState(MOCK_USERS)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [aiInsights, setAIInsights] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const chartRef = useRef(null)
  const fileInputRef = useRef(null)

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length > 0) {
          setFileData(jsonData)
          setColumns(Object.keys(jsonData[0]))
          setSelectedXAxis(Object.keys(jsonData[0])[0])
          setSelectedYAxis(Object.keys(jsonData[0])[1])

          // Add to history
          const newHistoryItem = {
            id: userHistory.length + 1,
            fileName: file.name,
            uploadDate: new Date().toISOString().split("T")[0],
            chartType: selectedChartType,
            size: `${Math.round(file.size / 1024)}KB`,
          }

          setUserHistory([newHistoryItem, ...userHistory])
          showNotification("File uploaded successfully!", "success")
        } else {
          showNotification("The file contains no data", "error")
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        showNotification("Error parsing Excel file", "error")
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      showNotification("Error reading file", "error")
      setIsLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  // Generate chart data based on selected axes and chart type
  useEffect(() => {
    if (fileData && selectedXAxis && selectedYAxis) {
      const labels = fileData.map((item) => item[selectedXAxis])
      const data = fileData.map((item) => item[selectedYAxis])

      const datasetConfig = {
        label: selectedYAxis,
        data: data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      }

      setChartData({
        labels: labels,
        datasets: [datasetConfig],
      })

      // Generate AI insights (mock)
      if (showAIInsights) {
        generateAIInsights(labels, data)
      }
    }
  }, [fileData, selectedXAxis, selectedYAxis, selectedChartType, showAIInsights])

  // Mock AI insights generation
  const generateAIInsights = (labels, data) => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Simple mock insights
      const average = data.reduce((a, b) => a + b, 0) / data.length
      const max = Math.max(...data)
      const maxIndex = data.indexOf(max)
      const min = Math.min(...data)
      const minIndex = data.indexOf(min)

      const insights = `
        ## AI Analysis Summary
        
        **Dataset Overview:**
        - ${labels.length} data points analyzed
        - Average ${selectedYAxis}: ${average.toFixed(2)}
        - Highest ${selectedYAxis}: ${max} (${labels[maxIndex]})
        - Lowest ${selectedYAxis}: ${min} (${labels[minIndex]})
        
        **Key Insights:**
        - The data shows a ${max > average * 1.5 ? "significant peak" : "consistent pattern"} for ${selectedYAxis}
        - ${labels[maxIndex]} has the highest value, which is ${((max / average - 1) * 100).toFixed(2)}% above average
        - Recommended action: Focus analysis on factors affecting ${labels[maxIndex]}
      `

      setAIInsights(insights)
      setIsLoading(false)
    }, 1500)
  }

  // Download chart as image
  const downloadChart = () => {
    if (chartRef.current) {
      const link = document.createElement("a")
      link.download = `chart-${new Date().toISOString().split("T")[0]}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
      showNotification("Chart downloaded successfully!", "success")
    }
  }

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle("dark-mode")
  }

  // Render the appropriate chart based on selected type
  const renderChart = () => {
    if (!chartData) return null

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `${selectedYAxis} by ${selectedXAxis}`,
        },
      },
    }

    switch (selectedChartType) {
      case "line":
        return <Line ref={chartRef} data={chartData} options={options} />
      case "pie":
        return <Pie ref={chartRef} data={chartData} options={options} />
      case "doughnut":
        return <Doughnut ref={chartRef} data={chartData} options={options} />
      case "bar":
      default:
        return <Bar ref={chartRef} data={chartData} options={options} />
    }
  }

  // Delete a history item
  const deleteHistoryItem = (id) => {
    setUserHistory(userHistory.filter((item) => item.id !== id))
    showNotification("Item removed from history", "success")
  }

  // Delete a user (admin only)
  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id))
    showNotification("User deleted successfully", "success")
  }

  return (
    <>
      {/* Bootstrap CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
        crossOrigin="anonymous"
      />

      <div className={`dashboard-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
        {/* Notification */}
        {notification.show && (
          <div className={`position-fixed top-0 end-0 p-3 notification-container`} style={{ zIndex: 1050 }}>
            <div className={`toast show alert alert-${notification.type === "success" ? "success" : "danger"}`}>
              <div className="toast-body">{notification.message}</div>
            </div>
          </div>
        )}

        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className={`sidebar col-auto px-0 ${isSidebarCollapsed ? "sidebar-collapsed" : ""} bg-dark text-white`}
            >
              <div className="d-flex flex-column h-100">
                <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                  <h2 className={`h5 mb-0 ${isSidebarCollapsed ? "d-none" : ""}`}>Excel Analytics</h2>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  >
                    {isSidebarCollapsed ? "→" : "←"}
                  </button>
                </div>

                <div
                  className={`sidebar-user p-3 border-bottom border-secondary ${isSidebarCollapsed ? "text-center" : ""}`}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className={`ms-2 ${isSidebarCollapsed ? "d-none" : ""}`}>
                      <h6 className="mb-0">{currentUser.name}</h6>
                      <span className="badge bg-secondary">{currentUser.role}</span>
                    </div>
                  </div>
                </div>

                <nav className="sidebar-nav flex-grow-1 py-3">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${activeTab === "dashboard" ? "active bg-primary" : ""}`}
                        href="#"
                        onClick={() => setActiveTab("dashboard")}
                      >
                        <span className="me-2">📊</span>
                        <span className={isSidebarCollapsed ? "d-none" : ""}>Dashboard</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${activeTab === "upload" ? "active bg-primary" : ""}`}
                        href="#"
                        onClick={() => setActiveTab("upload")}
                      >
                        <span className="me-2">📤</span>
                        <span className={isSidebarCollapsed ? "d-none" : ""}>Upload</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${activeTab === "history" ? "active bg-primary" : ""}`}
                        href="#"
                        onClick={() => setActiveTab("history")}
                      >
                        <span className="me-2">📜</span>
                        <span className={isSidebarCollapsed ? "d-none" : ""}>History</span>
                      </a>
                    </li>
                    {currentUser.role === "admin" && (
                      <li className="nav-item">
                        <a
                          className={`nav-link ${activeTab === "admin" ? "active bg-primary" : ""}`}
                          href="#"
                          onClick={() => setActiveTab("admin")}
                        >
                          <span className="me-2">👑</span>
                          <span className={isSidebarCollapsed ? "d-none" : ""}>Admin</span>
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>

                <div className="sidebar-footer p-3 border-top border-secondary">
                  <button className="btn btn-outline-light w-100" onClick={toggleDarkMode}>
                    {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`main-content col px-0 ${isSidebarCollapsed ? "main-expanded" : ""}`}>
              {/* Header */}
              <header className="bg-light border-bottom p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h1 className="h4 mb-0">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                  <div className="header-actions">
                    {fileData && (
                      <button className="btn btn-success" onClick={downloadChart}>
                        <i className="bi bi-download me-1"></i> Download Chart
                      </button>
                    )}
                  </div>
                </div>
              </header>

              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="p-3">
                  {!fileData ? (
                    <div className="text-center py-5">
                      <div className="empty-state">
                        <h2 className="mb-3">Welcome to Excel Analytics</h2>
                        <p className="text-muted mb-4">Upload an Excel file to get started with data visualization</p>
                        <button className="btn btn-primary btn-lg" onClick={() => setActiveTab("upload")}>
                          Upload Excel File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dashboard-content">
                      <div className="card mb-4">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label htmlFor="x-axis" className="form-label">
                                  X-Axis:
                                </label>
                                <select
                                  id="x-axis"
                                  className="form-select"
                                  value={selectedXAxis}
                                  onChange={(e) => setSelectedXAxis(e.target.value)}
                                >
                                  {columns.map((column) => (
                                    <option key={column} value={column}>
                                      {column}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label htmlFor="y-axis" className="form-label">
                                  Y-Axis:
                                </label>
                                <select
                                  id="y-axis"
                                  className="form-select"
                                  value={selectedYAxis}
                                  onChange={(e) => setSelectedYAxis(e.target.value)}
                                >
                                  {columns.map((column) => (
                                    <option key={column} value={column}>
                                      {column}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="chart-type-selector d-flex flex-wrap gap-2 mb-3">
                            {CHART_TYPES.map((type) => (
                              <button
                                key={type.id}
                                className={`btn ${
                                  selectedChartType === type.id ? "btn-primary" : "btn-outline-secondary"
                                }`}
                                onClick={() => setSelectedChartType(type.id)}
                              >
                                <span className="me-2">{type.icon}</span>
                                <span>{type.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="card mb-4">
                        <div className="card-body">
                          <div className="chart-container" style={{ height: "400px", position: "relative" }}>
                            {isLoading ? (
                              <div className="d-flex justify-content-center align-items-center h-100">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            ) : (
                              renderChart()
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">AI Insights</h5>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="aiToggle"
                                checked={showAIInsights}
                                onChange={() => setShowAIInsights(!showAIInsights)}
                              />
                              <label className="form-check-label" htmlFor="aiToggle">
                                Enable AI Analysis
                              </label>
                            </div>
                          </div>

                          {showAIInsights && (
                            <div className="ai-content">
                              {isLoading ? (
                                <div className="d-flex justify-content-center py-4">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Generating insights...</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-light p-3 rounded">
                                  <pre className="mb-0">{aiInsights}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Tab */}
              {activeTab === "upload" && (
                <div className="p-3">
                  <div className="row">
                    <div className="col-12">
                      <div className="card mb-4">
                        <div className="card-body">
                          <div
                            className="upload-area text-center p-5 border border-2 border-dashed rounded"
                            onClick={() => fileInputRef.current.click()}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="display-1 mb-3">📁</div>
                            <h3>Upload Excel File</h3>
                            <p className="text-muted">Click to browse or drag and drop</p>
                            <p className="small text-muted">Supported formats: .xls, .xlsx</p>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept=".xls,.xlsx"
                              style={{ display: "none" }}
                            />
                          </div>
                        </div>
                      </div>

                      {isLoading && (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Processing file...</span>
                          </div>
                          <p className="mt-2">Processing file...</p>
                        </div>
                      )}

                      {fileData && (
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title mb-4">Data Preview</h5>
                            <div className="table-responsive mb-3">
                              <table className="table table-striped table-bordered">
                                <thead>
                                  <tr>
                                    {columns.map((column) => (
                                      <th key={column}>{column}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {fileData.slice(0, 5).map((row, index) => (
                                    <tr key={index}>
                                      {columns.map((column) => (
                                        <td key={column}>{row[column]}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {fileData.length > 5 && (
                                <p className="text-muted small text-end">Showing 5 of {fileData.length} rows</p>
                              )}
                            </div>

                            <button className="btn btn-primary" onClick={() => setActiveTab("dashboard")}>
                              View Dashboard
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="p-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Upload History</h5>

                      {userHistory.length === 0 ? (
                        <div className="text-center py-5">
                          <p className="text-muted">No upload history available</p>
                        </div>
                      ) : (
                        <div className="list-group">
                          {userHistory.map((item) => (
                            <div className="list-group-item list-group-item-action" key={item.id}>
                              <div className="d-flex w-100 justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  <div className="fs-2 me-3">
                                    {item.chartType === "bar" && "📊"}
                                    {item.chartType === "line" && "📈"}
                                    {item.chartType === "pie" && "🥧"}
                                    {item.chartType === "doughnut" && "🍩"}
                                  </div>
                                  <div>
                                    <h5 className="mb-1">{item.fileName}</h5>
                                    <div className="d-flex flex-wrap gap-3 text-muted small">
                                      <span>Uploaded: {item.uploadDate}</span>
                                      <span>Size: {item.size}</span>
                                      <span>Chart: {item.chartType}</span>
                                    </div>
                                  </div>
                                </div>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteHistoryItem(item.id)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Tab */}
              {activeTab === "admin" && currentUser.role === "admin" && (
                <div className="p-3">
                  <div className="row">
                    <div className="col-12 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-4">User Management</h5>
                          <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Role</th>
                                  <th>Data Usage</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.map((user) => (
                                  <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                      <span className={`badge ${user.role === "admin" ? "bg-primary" : "bg-success"}`}>
                                        {user.role}
                                      </span>
                                    </td>
                                    <td>{user.dataUsage}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => deleteUser(user.id)}
                                        disabled={user.id === 1} // Prevent deleting admin
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-4">System Statistics</h5>
                          <div className="row">
                            <div className="col-md-3 col-sm-6 mb-3">
                              <div className="card bg-light">
                                <div className="card-body text-center">
                                  <h6 className="card-subtitle mb-2 text-muted">Total Users</h6>
                                  <h2 className="card-title text-primary">{users.length}</h2>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                              <div className="card bg-light">
                                <div className="card-body text-center">
                                  <h6 className="card-subtitle mb-2 text-muted">Total Uploads</h6>
                                  <h2 className="card-title text-primary">{userHistory.length}</h2>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                              <div className="card bg-light">
                                <div className="card-body text-center">
                                  <h6 className="card-subtitle mb-2 text-muted">Storage Used</h6>
                                  <h2 className="card-title text-primary">2.47GB</h2>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                              <div className="card bg-light">
                                <div className="card-body text-center">
                                  <h6 className="card-subtitle mb-2 text-muted">Active Users</h6>
                                  <h2 className="card-title text-primary">3</h2>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Make sure to export the Dashboard component as default
export default Dashboard
