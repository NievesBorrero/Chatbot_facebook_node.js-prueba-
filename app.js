
/*---CONFIGURACIÓN/ CONEXIÓN DE LA APLICACIÓN CON NUESTRO SISTEMA-----*/


/* Llamamos al paquete express para obtener todas sus funcionalidades.*/
const express = require('express')

const bodyParser = require ('body-parser')

const request = require ('request')

/*Token de acceso a nuestra página de facebook*/
const APP_TOKEN ='EAAYuPkoZA9iIBAIKwpkGBnrkxZAyxyOvtZCbTfNYHznWLpH16l39wOC1RB5DMES38R9aVHTvDLJZBszpfFAGzAl175QY9Yv11NB0utT1ZArzRLQwxJ3tyqwAnbnrt7ea7cuyxbsCuylZCGwCKiTGkB6A6AI2OA2wi3kvVjtZBhQKpaZB87AZC9ouP'

/*En la variable app guardamos todas las funcionalidades que se 
obtienen de la variable express*/
var app = express()

app.use(bodyParser.json())

/* El servidor se iniciará en el puerto 3000 (usamos el método listen) y enviará el mensaje mediante
un callback.
*/
app.listen(3000, function(){
	console.log('server listen localhost: 3000')
})

/*
Método get--> para la obtención del contenido. El método “get” usa un callback donde recibe los objetos 
para hacer las respuestas y obtener solicitudes.

Para que el servidor reaccione si entramos desde la raíz del dominio--> ('/')

Método send--> para enviar el mensaje*/
app.get('/', function(req, res){
	res.send('Abriendo el puerto desde local con http://ngrok.com')
})

/* Esto es para configurar los webhook */
app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === 'clave_programado'){
		res.send(req.query['hub.challenge'])
	}
	else{
		res.send('Aquí no debería entrar')
	}
	
})

/*---------------COMUNICACIÓN CON FACEBOOK----------------------*/

app.post('/webhook', function(req, res){
	var data = req.body /*Lo que facebook nos envía*/
	if(data.object== 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){
					getMsj(messagingEvent)

				}

			})
		})
	}
	res.sendStatus(200)
})

/* Permite obtener el mensaje enviado por el usuario*/
function getMsj(event){
	var senderID = event.sender.id
	var messageText = event.message.text

	procesarMsj(senderID, messageText)
}

/* 
Según el mensaje introducido, se generará una respuesta diferente para
enviarla al usuario
*/
function procesarMsj(senderID, messageText){	
	var mensaje= '';
	if(siContiene(messageText, 'ayuda')){
		mensaje= 'Por el momento no te puedo ayudar :('
	}
	else if(siContiene(messageText, 'info')){
		mensaje= 'Hola, qué tal? mi correo es probandoBots@gmail.com'
	}
	else{
		mensaje= 'Por ahora solo sé repetir las cosas: '+ messageText
	}

	enviarTextMsj(senderID, mensaje)

}


/* Busca dentro del texto si contiene esa letra*/
function siContiene(texto, palabra){
	return texto.indexOf(palabra) > -1 //Si en ese texto, el índice donde encuentra
										//la palabra es mayor de -1,la ha encontrado.
}

/* Permite enviar el mensaje de texto al usuario*/
function enviarTextMsj(senderID, msj){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: msj
		}
	}
	callSendAPI(messageData)
}

/* 
Responde a facebook para decirle que esa será la respuesta que le voy a dar 
al cliente y  que se encargue de enviarla--> api facebook 
*/
function callSendAPI(messageData){
	request({ //Hago uso del módulo request
		uri:'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData //Lo que voy a devolver. 
		}, function(error, response, data){
			if(error)
				console.log('No es posible mandar el mensaje')
			else
				console.log('Mensaje enviado')
					})
}

