
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

var PORT = process.env.PORT || 3000 

/* El servidor se iniciará en el puerto dado por heroku (usamos el método listen) y enviará el mensaje mediante
un callback.
*/
app.listen(PORT, function(){
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
	else if(siContiene(messageText, 'sombrero') && siContiene(messageText, 'recomienda')){
		enviarMensajeImagen(senderID)
		mensaje = 'Este...es tu sombrero, baby'
	}
	/*else if(siContiene(messageText, 'tiket')){
		enviarPdf(senderID)
	}*/
	else if(siContiene(messageText, 'clima') || siContiene(messageText, 'tiempo') || siContiene(messageText, 'temperatura')){
		getClima(function(_temperatura){
			enviarTextMsj(senderID, getMessageClima(_temperatura)) //Temperatura es una variable de callback, 
			                                                         //para distinguirla ponemos _ delante
		})
	}
	else if(siContiene(messageText, 'Hola')|| siContiene(messageText, 'hola')){
		typing_on(senderID)
		mensaje = 'Hola, me parece que esa linda testa requiere de un sombrero acorde 🎩'
		typing_on(senderID)
		enviarMensajeTemplate(senderID)
	}
	else{
		mensaje= 'Por ahora solo sé repetir las cosas: '+ messageText
	}

	enviarTextMsj(senderID, mensaje)

}

/* Simula que nuestro bot está escribiendo */
function typing_on(senderID){
	var messageData = {
		"recipient":{
	  		"id":"USER_ID"
	  	},
	  		"sender_action":"typing_on"
	  	}

	  	callSendAPI(messageData)
}

/**
* Envía un mensaje en una plantilla de tipo genérico.
*/
function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient:{
	    	id: senderID
	  	},
		  message:{
		    attachment:{
		      type:"template",
		      payload:{
		        template_type:"generic",
		        elements:[elementTemplate()]
		      }
		    }
		  }
		}

  callSendAPI(messageData)
}

/* Devuelve los elementos de los que consta la plantilla de tipo genérico*/
function elementTemplate(){
	 return{ 
			title:"El sombrerero",
		 	item_url: "https://www.google.es/",
	     	image_url:"https://1.bp.blogspot.com/-D27cqLlmkRo/Vz-7M0e1u4I/AAAAAAAAFHw/Lar1Wwx21sspXZUnuNnfqlQ4nQ9oLiKmwCLcB/s1600/sombrerero%2BlocoII.jpg",
	     	subtitle:"Estilista, fabricante de sombreros y amante del té",
	      	buttons:[
		          	buttonTemplate('Sitio web', 'https://sombrero.bon-clic-bon-genre.es/'),
		          	buttonTemplate('Github', 'https://github.com/NievesBorrero?tab=repositories')
	          ]
      }
}

/* Permite crear un botón de tipo web url */
function buttonTemplate(title, url){
	return{
		type: 'web_url',
		url: url,
		title: title
	}
}

/* Busca dentro del texto si contiene esa letra*/
function siContiene(texto, palabra){
	if(typeof texto=='undefined' || texto.lenght<=0) 
			return false
		return texto.indexOf(palabra) > -1 //Si en ese texto, el índice donde encuentra
										//la palabra es mayor de -1,la ha encontrado.
}

/* Permite enviar una imagen*/
function enviarMensajeImagen(senderID){
	var messageData = {
		recipient:{
    		id: senderID
  	},
  	message:{
    	attachment:{
      		type:"image",
      		payload:{
        		url:"https://images-na.ssl-images-amazon.com/images/I/41BvJmGizBL._SY300_.jpg"
      		}
    	}
  	}
}
	callSendAPI(messageData)

	}

/* Permite enviar un pdf 
function enviarPdf(senderID){
	var messageData = {
  		 recipient: {
  		 	id:senderID
  		 }, 
         message:{
         	attachment:{
         		type:"file", 
         		payload:{ 
         		url: "https://codeweb.000webhostapp.com/files/prueba.pdf"
         		}}},                  
	}

	callSendApi(messageData)
}*/


/*----------------------------- TEMPERATURA --------------------------*/

/* Permite enviar el mensaje de texto plano al usuario*/
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


/*Permite enviar el mensaje al usuario en temperatura*/
function getClima(callback){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg'),
	function(error, response, data){
		if(!error){
			var response = JSON.parse(data) // Parseamos todo el objeto a JSON para poder trabajarlo, ya que la url nos devuelve solo un texto plano
			var temperatura = response.weatherObservation.temperature
			callback(temperatura) //Ejecutamos el callback devolviendo la temperatura.
		}
		else{
			callback(15) // Temperatura por defecto.
		}
	}
}

/*Formatea el texto de regreso al cliente*/
function getMessageClima(temperatura){
	if(temperatura > 30){
		return 'Nos encontramos a '+temperatura+', hace demasiada calor... Comprate una limonada :V'
	}
	else{
		return 'Nos encontramos a'+temperatura+', es un buen día para salir'
	}
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


