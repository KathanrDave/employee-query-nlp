const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Endpoint to fetch employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to insert employee data
app.post('/employees', async (req, res) => {
  const { name, email, check_in, check_out } = req.body;
  try {
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        check_in: new Date(check_in).toISOString(),
        check_out: new Date(check_out).toISOString(),
      },
    });
    res.json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for executing queries
app.post('/query', async (req, res) => {
  const { query } = req.body;
  try {
    console.log(query);
    const response = await axios.post('http://127.0.0.1:5001/translate', { query });
    const sqlQuery = response.data.sql;
    if (response.data.error) {
      res.status(400).json({ error: response.data.error });
      return;
    }
    const result = await prisma.$queryRawUnsafe(sqlQuery);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
