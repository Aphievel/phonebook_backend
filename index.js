const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');
const app = express();
app.use(express.json());
app.use(
	morgan(
		':method :url :status :res[content-length] - :response-time ms :content'
	)
);
app.use(express.static('build'));

morgan.token('content', function getContent(req) {
	if (req.method === 'POST') {
		return JSON.stringify(req.body);
	} else {
		return '';
	}
});

const errorHandler = (error, request, response, next) => {
	console.log(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	}

	next(error);
};

app.use(errorHandler);

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
	Person.find({}).then((res) => {
		response.json(res);
	});
});

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			response.json(person);
		})
		.catch((error) => next(error));
});

app.get('/info', async (request, response) => {
	const time = new Date();
	const number = await Person.estimatedDocumentCount();
	response.send(
		`<div>Phonebook has info for ${number} people</div><div>${time}</div>`
	);
});

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then((result) => {
			response.status(204).end();
		})
		.catch((error) => next(error));

	response.status(204).end();
});

app.post('/api/persons', (request, response) => {
	if (!request.body.name || !request.body.number) {
		return response.status(400).json({ error: 'Name or number missing' });
	} else if (persons.find((person) => person.name === request.body.name)) {
		return response.status(400).json({ error: 'Name must be unique' });
	}
	const person = new Person({
		name: request.body.name,
		number: request.body.number,
	});
	person.save();
	response.json(person);
});

app.put('/api/persons/:id', (request, response, next) => {
	const person = {
		number: request.body.number,
	};
	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then((updatedPerson) => response.json(updatedPerson))
		.catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
