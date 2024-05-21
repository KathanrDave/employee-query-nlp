# Employee Query NLP Application

## Assignment Details

### Objective

Create a frontend-backend system with a Postgres database for employee data, a query interface for user inputs, NLP interpretation to generate SQL queries, execution and display of results, and deployment on a chosen server platform.

### Functionalities

- Add new employees to the database.
- View and create employee data.
- Query functionality to translate natural language into SQL and display the results.

## Implementation
![image](https://github.com/KathanrDave/employee-query-nlp/assets/108331571/ddbe98b6-2e46-4654-bfea-2a34d1ee7744)

### Tech stack 
#### Backend:
Node.js with Express
Python Flask app for NLP
#### Frontend:
React with JavaScript
Database:
Postgres SQL
### Deployment:
- Backend (Node.js, Flask, Postgres) deployed on Render
- Frontend deployed on Vercel
![image](https://github.com/KathanrDave/employee-query-nlp/assets/108331571/bf841add-bb4c-41ea-876e-fc08924d9ba6)


### 1. Node - Express Backend

The backend is built using Node.js with the Express framework. It handles the API endpoints for fetching, adding, and querying employee data.

**Key Endpoints:**
- **Fetch Employees**: `GET /employees`
- **Add Employee**: `POST /employees`
- **Execute Query**: `POST /query`

**Code:** [index.js](index.js)

### 2. NLP Backend Logic

The NLP logic is implemented using a Python Flask app that leverages the Spacy library for natural language processing.
**Key Endpoints:**
- **Parse Query**: Parses the natural language query to generate a corresponding SQL query.
- **Adjust Time by Offset**:  Adjusts the time based on a specified offset.


**Code:** [app.py](app.py)

### 3. Node - Express Backend

The frontend is built using React and styled with Tailwind CSS. It provides interfaces for querying, adding, and viewing employee data.

**Key Components:**
- **Home**
- **Query**:  Interface for entering and submitting queries.
- **EmployeeList**: Displays the list of employees.
- **AddEmployee**: Form to add new employees.

**Code:** [App.js](https://github.com/KathanrDave/employee-query-nlp/blob/master/frontend/src/App.js)

----
## How the Project is Built
#### Backend (Node.js with Express)
- Employee Data Management: The Node.js backend handles the creation and retrieval of employee data using an Express server. It connects to a Postgres database to store employee details such as name, email, check-in, and check-out times.
- Query Handling: The backend exposes an endpoint to receive natural language queries, which are then sent to the NLP service for translation into SQL.
- Integration with NLP Service: The backend sends the user’s natural language queries to a Flask-based NLP service, retrieves the generated SQL query, executes it against the Postgres database, and returns the results.
#### NLP Backend (Python Flask App)
- Natural Language Processing: The Flask app uses SpaCy to parse natural language queries and extract relevant information such as times and employee names.
- SQL Query Generation: Based on the extracted information, the Flask app generates a corresponding SQL query to fetch the desired data from the Postgres database.
#### Frontend (React)
- User Interface: The React frontend provides a user-friendly interface for interacting with the employee data and querying the database.
- Query Input: A text box allows users to enter natural language queries.
- Display Results: The results of the queries are displayed in a table format.
- Add Employee: A form to add new employees to the database.
- View Employees: A table to view the current list of employees and their check-in/check-out times.



## Difficulties Encountered
- NLP Logic: Developing the logic for Natural Language Processing posed challenges during implementation.
- Deployment: Attempted deployment through Docker but faced issues that were not resolved.

## Results
#### Test Queries 
```
How many employees checked in before 9 AM on May 20, 2024?
Show me all employees who checked out after 5 PM today.
List employees who were online between 8 AM and 10 AM on April 15, 2023.
What is the average check-in time for employees?
Give me a list of employees ordered by their check-out times.
```

### Contact Information
- Name: Kathan Dave
- Email: kathanrdave003@gmail.com
- Live [Link](https://employee-query-nlp.vercel.app/)
- Organization: MeitY
- Product: Karmayogi
