//Importamos las librarías requeridas
const express = require('express');
const bodyParser = require('body-parser');

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json();

// Importamos  el módulo de SQLite
const sqlite3 = require('sqlite3').verbose();
let db = null;

const openDB = () => {
	// Generar un objeto de DB
	let db = new sqlite3.Database('TODOS', (err) => {
		err
			? console.log('Error al conectar')
			: console.log('Conectado exitosamente');
	});

	const createTableQuery = `
        CREATE TABLE IF NOT EXISTS TODOS (
        todo_id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo VARCHAR(100) NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
        `;

	db.run(createTableQuery, (err) => {
		if (err) {
			console.log('Error al crear tabla: ', err);
		} else {
			console.log('Tabla creada correctamente');
		}
	});

	return db;
};

const closeDB = (db) => {
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Cerrando conexión de base de datos.');
	});
};

app.get('/', function (req, res) {
	//Enviamos de regreso la respuesta
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ status: 'ok' }));
});

//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
	//Imprimimos el contenido del body
	console.log(req.body);

	//Enviamos de regreso la respuesta
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ status: 'ok' }));
});

//Creamos un endpoint para recibir los todos
app.post('/agrega_todo', jsonParser, function (req, res) {
	//Imprimimos el contenido del body
	console.log("Parámetros enviados a endpoint 'agregar_todo'", req.body);

	let todo = req.body.todo;

	// Mandamos a abrir nuestra conexión a DB
	// y asignamos objeto de retorno a una variable
	let db = openDB();

	// Generamos la query a ejecutar con los datos obtenidos por body.
	let query = `
    INSERT INTO TODOS ('todo')
    VALUES( '${todo}')`;

	// Ejecutamos la query contra la DB y evaluamos resultados
	db.run(query, (err, rows) => {
		if (err) {
			console.log('Error al insertar TODO: ', err);
		} else {
			console.log('TODO creado correctamente');
		}
	});

	// Cerramos nuestra DB
	closeDB(db);

	//Enviamos de regreso la respuesta
	res.setHeader('Content-Type', 'application/json');
	res
		.status(201)
		.send(JSON.stringify({ Response: `TODO '${todo}' creado correctamente` }));
});

app.get('/get_todos', jsonParser, function (req, res) {
	// Mandamos a abrir nuestra conexión a DB
	// y asignamos objeto de retorno a una variable
	let db = openDB();

	// Generamos la query a ejecutar para retornar todos los datos.
	let query = `SELECT * FROM TODOS;`;

	// Ejecutamos la query contra la DB y evaluamos resultados
	db.all(query, (err, rows) => {
		if (err) {
			console.log('Error al devolver todos: ', err);
		} else {
			console.log('Todos recuperados: ', rows);
		}
		//Enviamos de regreso la respuesta
		res.setHeader('Content-Type', 'application/json');
		res.status(201).send(JSON.stringify({ todos: rows }));
	});

	// Cerramos nuestra DB
	closeDB(db);
});

//Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
	console.log(`Aplicación corriendo en http://localhost:${port}`);
});
