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

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
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
  person
    .save()
    .then((savedPerson) => res.json(savedPerson))
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  if (!body.name) {
    return res.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: "number is missing",
    });
  }
  const updatePerson = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(id, updatePerson)
    .then((person) => {
      if (person) {
        res.json(updatePerson);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        res.status(204).end();
      } else res.status(404).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: "name must be unique" });
  }

  next(error);
};
app.use(errorHandler);

const PORT = 3001;
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${process.env.PORT || PORT}`);
});
