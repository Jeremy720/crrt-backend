const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
const database = require('knex')(config);
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

//Endpoints

app.get('/api/v1/cases', (request, response) => {
	database('cases').select()
	.then(cases => response.status(200).json(cases))
	.catch(error => response.status(500).json({
		error: error.message
	}));
});

app.post('/api/v1/cases', (request, response) => {
	const patientCase = request.body;

	database('cases').insert(patientCase, 'id')
		.then(caseIds => response.status(201).json({
			id: caseIds[0],
			message: `Case successfully created!`
		}))
		.catch(error => response.status(500).json({
			error: error.message
		}));
});

app.patch('/api/v1/cases/:id', (request, response) => {
	const { id } = request.params;
	const newEntry = request.body;

	let missingProp = [];

	for(let requiredParam of [
		"sodiumProductionRate",
    "potassiumProductionRate",
    "chlorideProductionRate",
    "bicarbonateProductionRate",
    "BUNProductionRate",
    "creatinineProductionRate",
    "calciumProductionRate",
    "filtrationFractionStarting",
    "gender",
    "usualWeight",
    "historyOfPresentIllness",
    "vitalSigns",
    "medications",
    "imaging",
    "physicalExam"
	]) {
		if(!newEntry[requiredParam]) {
			missingProp = [...missingProp, requiredParam]
		}
		if(missingProp.length) {
			return response.status(415).json({
				error: error.message
			})
		}
	}

	database('cases').where('id', id)
		.update(newEntry)
		.then(newEntry => {
			response.status(204).json(newEntry)
		})
		.catch(error => response.status(500).json({
			error: error.message
		}));
});

app.delete('/api/v1/cases/:id', (request, response) => {
	const { id } = request.params;
	database('cases').where('id', id).delete()
		.then(caseId => response.status(200).json({
			id: id,
			message: `Case ${id} has been deleted.`
		}))
		.catch(error => response.status(500).json({
			error: `Error deleting case: ${error.message}`
		}));
});

app.use((request, response) => {
	response.status(404).send('Sorry, the path you entered does not exist.');
});

app.listen(app.get('port'), () => {
	console.log(`Server is running on ${app.get('port')}.`)
});

module.exports = app;