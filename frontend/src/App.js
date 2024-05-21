import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import "tailwindcss/tailwind.css";

const Home = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold">Welcome to the Employee Query App</h2>
    <p className="mt-4">
      This application allows you to query employee details, add new employees,
      and view the employee database. 
    </p>
  </div>
);

const Query = ({
  query,
  setQuery,
  results,
  setResults,
  error,
  setError,
  formatDateTime,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://employee-query-nlp-node.onrender.com/query", {
        query,
      });
      setResults(response.data);
      setError(null);
    } catch (error) {
      setError(
        error.response ? error.response.data.error : "An error occurred"
      );
      console.error("Error querying:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Query Employees</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border rounded p-2 w-full"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <h3 className="text-xl font-semibold mt-6">Results</h3>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Check In</th>
            <th className="px-4 py-2">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td className="border px-4 py-2">{result.id}</td>
              <td className="border px-4 py-2">{result.name}</td>
              <td className="border px-4 py-2">{result.email}</td>

              <td className="border px-4 py-2">
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded">
                  {formatDateTime(result.check_in)}
                </button>
              </td>
              <td className="border px-4 py-2">
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded">
                  {formatDateTime(result.check_out)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EmployeeList = ({ employees, formatDateTime }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold">Employee Database</h2>
    <table className="table-auto w-full mt-4">
      <thead>
        <tr>
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Check In</th>
          <th className="px-4 py-2">Check Out</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="border px-4 py-2">{employee.id}</td>
            <td className="border px-4 py-2">{employee.name}</td>
            <td className="border px-4 py-2">{employee.email}</td>

            <td className="border px-4 py-2">
              <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded">
                {formatDateTime(employee.check_in)}
              </button>
            </td>
            <td className="border px-4 py-2">
              <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded">
                {formatDateTime(employee.check_out)}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AddEmployee = ({
  newEmployee,
  setNewEmployee,
  handleAddEmployee,
  handleInputChange,
}) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold">Add New Employee</h2>
    <form className="space-y-4">
      <input
        className="border rounded p-2 w-full"
        type="text"
        name="name"
        value={newEmployee.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <input
        className="border rounded p-2 w-full"
        type="email"
        name="email"
        value={newEmployee.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        className="border rounded p-2 w-full"
        type="datetime-local"
        name="check_in"
        value={newEmployee.check_in}
        onChange={handleInputChange}
        placeholder="Check In"
      />
      <input
        className="border rounded p-2 w-full"
        type="datetime-local"
        name="check_out"
        value={newEmployee.check_out}
        onChange={handleInputChange}
        placeholder="Check Out"
      />
      <button
        type="button"
        onClick={handleAddEmployee}
        className="bg-green-500 text-white p-2 rounded"
      >
        Add Employee
      </button>
    </form>
  </div>
);

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    check_in: "",
    check_out: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("https://employee-query-nlp-node.onrender.com/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  const handleAddEmployee = async () => {
    try {
      const formattedEmployee = {
        ...newEmployee,
        check_in: new Date(newEmployee.check_in).toISOString(),
        check_out: new Date(newEmployee.check_out).toISOString(),
      };

      await axios.post("https://employee-query-nlp-node.onrender.com/employees", formattedEmployee);

      const response = await axios.get("https://employee-query-nlp-node.onrender.com/employees");
      setEmployees(response.data);

      setNewEmployee({
        name: "",
        email: "",
        check_in: "",
        check_out: "",
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    return `${dateObj.toLocaleDateString("en-US")} ${dateObj.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  return (
    <div className="font-sans min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4">
        <ul className="flex space-x-4 text-white">
          <li>
            <a href="#home" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="#query" className="hover:underline">
              Query
            </a>
          </li>
          <li>
            <a href="#employee-list" className="hover:underline">
              Employee List
            </a>
          </li>
          <li>  
            <a href="#add-employee" className="hover:underline">
              Add Employee
            </a>
          </li>
        </ul>
      </nav>
      <div id="home" className="p-6">
        <Home />
      </div>
      <div id="query" className="p-6">
        <Query
          query={query}
          setQuery={setQuery}
          results={results}
          setResults={setResults}
          error={error}
          setError={setError}
          
          formatDateTime={formatDateTime}
        />
      </div>
      <div id="employee-list" className="p-6">
        <EmployeeList employees={employees} formatDateTime={formatDateTime} />
      </div>
      <div id="add-employee" className="p-6">
        <AddEmployee
          newEmployee={newEmployee}
          setNewEmployee={setNewEmployee}
          handleAddEmployee={handleAddEmployee}
          handleInputChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default App;
