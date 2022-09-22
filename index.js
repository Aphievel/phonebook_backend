const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(
	morgan(
		':method :url :status :res[content-length] - :response-time ms :content'
	)
);

morgan.token('content', function getContent(req) {
	if (req.method === 'POST') {
		return JSON.stringify(req.body);
	} else {
		return '';
	}
});

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
	response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find((person) => person.id === id);

	if (!person) {
		return response.status(404).end();
	}
	response.json(person);
});

app.get('/info', (request, response) => {
	const time = new Date();
	response.send(
		`<div>Phonebook has info for ${persons.length} people</div><div>${time}</div>`
	);
});

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter((person) => person.id !== id);

	response.status(204).end();
});

app.post('/api/persons', (request, response) => {
	if (!request.body.name || !request.body.number) {
		return response.status(400).json({ error: 'Name or number missing' });
	} else if (persons.find((person) => person.name === request.body.name)) {
		return response.status(400).json({ error: 'Name must be unique' });
	}
	const person = {
		id: Math.floor(Math.random() * 1000),
		name: request.body.name,
		number: request.body.number,
	};
	persons = persons.concat(person);
	response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
