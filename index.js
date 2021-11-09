const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(cors());
app.use(express.json());
app.use(morgan(":method :url :status :response-time :body"));
app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.get("/info", (req, res) => {
  const now = new Date().toString();
  Person.find({}).then((persons) =>
    res.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${now}</p>`
    )
  );
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findById(id).then((person) => {
    if (person) {
      res.json(person);
    } else {
      res.status(404).end();
    }
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: "number is missing",
    });
  }
  const person = new Person({ name: body.name, number: body.number });
  person.id = id;
  person
    .save()
    .then((savedPerson) => res.json(savedPerson))
    .catch((error) => res.status(400).json(error));
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id).then((deletedPerson) => {
    if (deletedPerson) {
      res.status(204).end();
    } else res.status(404).end();
  });
});

const PORT = 3001;
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${process.env.PORT || PORT}`);
});
