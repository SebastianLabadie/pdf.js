import { ENV_documentGetURL, ENV_documentSaveUrl,ENV_BASE_URL,ENV_askLandscapeinPhones,ENV_decryptURLParams,ENV_documentDataInterface,ENV_documentGetFromPAD,ENV_documentPcToPAD,ENV_documentSendToPAD,ENV_forceLandscapeinPhones,ENV_license,ENV_signatureAskEachWhenAutoStep,ENV_signatureManualWhenAutoStep,ENV_signatureMaxAmount,ENV_signatureMinAmount, obtenerDocumento } from "./firmaUtils.js";

const axios = window.axios
const SignaturePad = window.SignaturePad





/*Variables Globales */
let e_d = "";
let e_d_dmy = "";
let autoStepAmount = 0;
let autoStepinProgress = 0;
let autoStepCurrent = 0;
let pruebaY = 0;
let pruebaX = 0;
let licdata = ENV_license;
let a_d = new Date();
const BASE_URL = ENV_BASE_URL;
let saveDocURL = BASE_URL+ENV_documentSaveUrl;
let sendPADURL = BASE_URL+ENV_documentSendToPAD;
let getPADURL = BASE_URL+ENV_documentGetFromPAD;
let getDocData = BASE_URL+ENV_documentDataInterface;
let forceLandscapeinPhones = BASE_URL+ENV_forceLandscapeinPhones;
let askLandscapeinPhones = BASE_URL+ENV_askLandscapeinPhones;
let Params = "";
let username = "PELICEGUI";
let padResponse =0 
let signx = 0;
let signy = 0;
var { pdfjsLib } = globalThis;
let documento = null
let capturedCanvas = null
window.signaturecount = 0
const vecInterventoresFirmaLibre = []
const SDTFirmaGuardar = [
]



//Sacar document ready y ponner el event listener cuando se cargue el pdf
async function iniciarFirma() {
	console.log("🚀 ~ file: firma.js:47 ~ iniciarFirma ~ iniciarFirma")
	documento  = await obtenerDocumento();
	mockDivsAutostep()
		
	// Mostrar popup de la licencia
	// showOrientationDiv();
	$("#license-info").click(function () {
		$("#LicenseInfoPopup").fadeIn("fast").css("display", "flex");
		$("#actionTable").fadeOut("fast");

		$(document).keyup(function (e) {
			if (e.keyCode === 27) {
				$("#LicenseInfoPopup").fadeOut("fast");
			}
		});
	});

	$(".closeLicenseInfoPopup").click(function () {
		$("#LicenseInfoPopup").fadeOut("fast");
		$("#actionTable").fadeIn("fast");
	});

	let modal = document.getElementById("FinishModal");
	modal.style.display = "none";
	let alertModal = document.getElementById("AlertModal");
	alertModal.style.display = "none";
	let alertModal2 = document.getElementById("AlertLicense");
	alertModal2.style.display = "none";
	let padModal = document.getElementById("PadModal");
	padModal.style.display = "none";

	//Obtener parametros
	// if (window.location.search.slice(1).search("Params") == -1) {
	// 	Params = window.location.search.slice(1);
	// } else {
	// 	let params = window.location.search.slice(1).split("&");
	// 	console.log("params:" + params);
	// 	for (let p = 0; p < params.length; p++) {
	// 		let nv = params[p].split("=");
	// 		let name = nv[0],
	// 			value = nv[1];
	// 		if (name == "EmpresaId") {
	// 			//Cargar EmpresaId
	// 			EmpresaId = value;
	// 		}
	// 		if (name == "Params") {
	// 			//Cargar EmpresaId
	// 			Params = "Params=" + value;
	// 		}
	// 		console.log(name)
	// 		if (name == "username") {
	// 			username = value;
	// 		}
	// 	}
	// }

	obtenerDatosInterface();

	// Validar dispositivo y orientación
	console.log("askLandscapeinPhones: " + askLandscapeinPhones);
	const deviceType = getDeviceType();

	if (deviceType === "T" || deviceType === "P") {
		console.log("entro en devicetype");
		if (forceLandscapeinPhones === "1") {
		} else {
			console.log("else de force:");
			if (parseInt(askLandscapeinPhones) === 1) {
				console.log("valido getOrientation");
				getOrientation();
				window.onorientationchange = (event) => {
					getOrientation();
				};
			}
		}
	}
	

	// Manejo de licencia
	getSignArea();
	$(".license-expiration-date").html(e_d_dmy);
	if (e_d < a_d) {
		$(".license-status").html("EXPIRADA").addClass("license-error");
		$(".license-expiration-date").addClass("license-next-to-expire");
	}

	var e_d_timestamp = new Date(e_d).getTime();
	var a_d_timestamp = a_d.getTime();
	var microSecondsDiff = e_d_timestamp - a_d_timestamp;
	var daysDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60 * 24));

	if (daysDiff <= 0) {
		// Licencia expirada
		$(".next-to-expire").css("display", "block");
		$(".license-expiration-date").addClass("red");
		$(".next-to-expire").html("Licencia expirada");
		$("#actionTable").fadeOut("fast");
		$("#LicenseInfoPopup").fadeIn("fast").css("display", "flex");
	} else {
		if (daysDiff < 16) {
			// Mostrar popup al iniciar, una vez por día, si la licencia expira en 15 días o menos
			if (!!$.cookie("nextToExpire")) {
				$(".next-to-expire").css("display", "block");
				$(".license-expiration-date").addClass("red");
			} else {
				$(".next-to-expire").css("display", "block");
				$(".license-expiration-date").addClass("red");
				$("#actionTable").fadeOut("fast");
				$("#LicenseInfoPopup").fadeIn("fast").css("display", "flex");
				$.cookie("nextToExpire", "yes", { expires: 0.6 });
			}
		}
	}
	// });
	
	const signaturePad = new SignaturePad(document.getElementById("signature-pad"), {
		backgroundColor: "rgba(255, 255, 255, 0)",
		penColor: "rgb(0, 0, 0)",
	});
	// signaturePad.addEventListener('beginStroke',(e)=>{
	// 	console.log('beginStroke',e.detail.pressure)
	// })
	// signaturePad.addEventListener('endStroke',(e)=>{
	// 	console.log('endStroke',e.detail.pressure)
	// })
	// signaturePad.addEventListener('beforeUpdateStroke',(e)=>{
	// 	console.log('beforeUpdateStroke',e.detail.pressure)
	// })
	// signaturePad.addEventListener('afterUpdateStroke',(e)=>{
	// 	console.log('afterUpdateStroke',e.detail.pressure)
	// })

	

	const saveButton = document.getElementById("save");
	const cancelButton = document.getElementById("clear");
	const padButton = document.getElementById("pad");
	saveButton.addEventListener("click", function (event) {
		//TODO
		//Al guardar una firma guardaremos la metadata de la firma
		//Hay que validar si es obligatoria la firma que haya algo


		let padData = signaturePad.toData();
		// alert("🚀 ~ file: firma.js:175 ~ toData: "+ JSON.stringify(toData))

		let padImage = signaturePad.toDataURL("image/png");
	
		console.log("🚀 ~ file: firma.js:217 ~ window.signaturecount:", window.signaturecount)
		window.signaturecount = window.signaturecount + 1;
		let pagina = 0
		let GestionFirmaHojaId = '',GestionFirmaId='',GestionInterventorId=''
		let idxInterventor =  $(".autoStep:first").attr("autostep-interventor-idx");
		let idxFirma =  $(".autoStep:first").attr("autostep-firma-idx");

		//Si es autostep
		if (autoStepinProgress == 1) {
			//Obtener pagina de la firma
			pagina = $(".autoStep:first").attr("autostep-page");
			GestionFirmaHojaId = documento.SDTGestionConf.GestionInterventor[idxInterventor].GestionFirma[idxFirma].GestionFirmaHojaId
			GestionFirmaId = documento.SDTGestionConf.GestionInterventor[idxInterventor].GestionFirma[idxFirma].GestionFirmaId
			GestionInterventorId = documento.SDTGestionConf.GestionInterventor[idxInterventor].GestionInterventorId 

		} else {
			pagina = PDFViewerApplication.page
			GestionFirmaHojaId = '00000000-0000-0000-0000-000000000000'
			GestionFirmaId = '00000000-0000-0000-0000-000000000000'

			//Si solo hay 1 interventor con firmal libre habilitada, cargar idxInterventor con el interventor que tiene firma libre habilitada
			if (vecInterventoresFirmaLibre.length === 1 ) {
				GestionInterventorId = vecInterventoresFirmaLibre[0].GestionInterventorId 
			}else{
				//Si hay mas de 1 interventor con firma libre habilitada, buscamos en el selection cual fue el interventor que firmo
				const interventorSelected = $(`#interventorSelect`).val()
				GestionInterventorId = vecInterventoresFirmaLibre[interventorSelected].GestionInterventorId 
			}

		}


		SDTFirmaGuardar.push({
			GestionFirmaData: padData,
			GestiongFirmaImg: padImage,
			GestionFirmaX: pruebaX,
			GestionFirmaY: pruebaY,
			GestionFirmaHojaNro: pagina,
			GestionFirmaFecha: new Date().getTime(),
			GestionFirmaHojaId,
			GestionFirmaId,
			GestionInterventorId,
		})
		console.log("🚀 ~ SDTFirmaGuardar:", SDTFirmaGuardar)




		$(`.canvasPage-${pagina}`).append(
			'<div><img id="signature' +
				window.signaturecount +
				'" draggable="false" style=" -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;" /></div>'
		);
		$("#signature" + window.signaturecount).css({ top: pruebaY, left: pruebaX, position: "absolute" });
		// <!-- $('#signature1').src=url(data); -->
		$("#signature" + window.signaturecount).attr({ src: padImage });
		var modal = document.getElementById("myModal");
		modal.style.display = "none";
		signaturePad.clear();

		$("#actionTable").fadeIn("fast");
		// }
		if (autoStepinProgress == 1) {
			$(".autoStep:first").remove();
			nextSign();
		}
	});

	cancelButton.addEventListener("click", function (event) {
		signaturePad.clear();
		autoStepinProgress = 0;
	});

	padButton.addEventListener("click", async function (event) {
		try {
			// Consumir HTTP y enviar imagen al servidor

			const response = await axios.post(sendPADURL + username, {
				dataURL: capturedCanvas.toDataURL().replace("data:image/png;base64,", ""),
			});

			if (response.status === 200) {
				// Esconder todos los botones menos cancelarFirma
				padButton.style.display = "none";
				saveButton.style.display = "none";
				const archivoTerminal = response.data;
				// Mostrar mensaje de espera con icono de una tablet
				// Validar si existe archivo creado
				padResponse = 0;
				getPadResponse(archivoTerminal);
			} else {
				// Manejar el estado de error aquí
			}
		} catch (error) {
			// Manejar errores si es necesario
			console.error(error);
		}
	});
	
	// Llamado a funciones onClick
	$("#addFirma").click(() => {
		AddFirma();
	});
	$("#autoStep").click(() => {
		autoStep();
	});
	$("#cancelar").click(() => {
		cancelarFirma();
	});
	$("#OKSign").click(() => {
		callSignPad();
	});
	$("#CancelSign").click(() => {
		cancelarFirma();
	});
	$("#guardarPDF").click(async () => {
		await guardarPDF();
	});
};

function getPadResponse(archivoTerminal) {
	$("#myModal").fadeOut("fast");

	$("#PadModal").fadeIn("fast").css("display", "flex");

	window.BuscarRespuestaPadInterval = setInterval(async function BuscarRespuestaPad() {
		try {
			const response = await axios.get(getPADURL + username + "_FIRMA_LISTA");

			console.log(`PAD FIRMO `,response.data)
			if (response.data !== "") {
				padResponse = 1;

				if (response.data === "CANCELAR") {
					alert(cancelado);
					autoStepinProgress = 0;
				} else {
					window.signaturecount = window.signaturecount + 1;
					$(`.canvasPage-${PDFViewerApplication.page}`).append(
						'<img id="signature' +
							window.signaturecount +
							'" draggable="false" style=" -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none" />'
					);
					$("#signature" + window.signaturecount).css({ top: pruebaY, left: pruebaX, position: "absolute" });
					$("#signature" + window.signaturecount).attr({ src: response.data });

					if (autoStepinProgress == 1) {
						$(".autoStep:first").remove();
						nextSign();
					}
				}
				$("#myModal").fadeOut("fast");
				$("#PadModal").fadeOut("fast");
				$("#actionTable").fadeIn("fast");
				clearInterval(window.BuscarRespuestaPadInterval);
			} else {
				// Vuelve a llamar a buscarRespuestaPad después de 5 segundos
				//   setTimeout(buscarRespuestaPad, 5000);
			}
		} catch (error) {
			// Manejar errores si es necesario
			console.error(error);
			// Vuelve a llamar a buscarRespuestaPad después de 5 segundos en caso de error
			// setTimeout(buscarRespuestaPad, 5000);
			clearInterval(window.BuscarRespuestaPadInterval);
		}
	}, 5000);
}

function guardarPDF() {
	if (window.signaturecount < 1) {
		$("#actionTable").fadeOut("fast");
		$("#AlertModal").fadeIn("fast").css("display", "flex");
		setTimeout(function () {
			// alertModal.style.display = "none";
			$("#AlertModal").fadeOut("fast");
			$("#actionTable").fadeIn("fast");
		}, 3000);
	} else {
		$("#actionTable").fadeOut("fast");
		// S save
		var xmlHttp = new XMLHttpRequest();
		// <!-- var FileName="Hola.pdf"; -->
		xmlHttp.open("POST", `${saveDocURL}${Params},S,${username}`, true);
		// <!-- xmlHttp.responseType = 'blob'; -->
		xmlHttp.onreadystatechange = function () {
			xmlHttp.onload = function (e) {
				if (this.status == 200) {
					// Create a new Blob object using the response data of the onload object
					var blob = new Blob([this.response], { type: "image/pdf" });
					//Create a link element, hide it, direct it towards the blob, and then 'click' it programatically
					let a = document.createElement("a");
					a.style = "display: none";

					//Create a DOMString representing the blob and point the link element towards it
					let url = window.URL.createObjectURL(blob);
					
					window.URL.revokeObjectURL(url);
					var modal = document.getElementById("FinishModal");
					modal.style.display = "flex";
					var modal = document.getElementById("actionTable");
					modal.style.display = "none";
				} else {
					//deal with your error state here
				}
			};
		};
		xmlHttp.send(
			'<head><meta charset="UTF-8"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body style="margin:0px;padding:0px;">' +
				$(`.canvasPage-${PDFViewerApplication.page}`).html() +
				"</body>"
		);
	}
}

function AddFirma() {
	if (getSignArea()) {
		// $('#chooseSign').show();
		showChooseSign();
		// $("#chooseSign").css({ top:topPagina.+ "px", left: "0px", "z-index": 9998 });
		$("#actionTable").fadeOut("fast");
		$(document).keyup(function (e) {
			if (e.keyCode === 27 && ($("#chooseSign").is(":visible") || $("#myModal").is(":visible"))) cancelarFirma(); // Escape
		});
	} else {
		$("#actionTable").fadeOut("fast");
		$("#AlertLicense").fadeIn("fast").css("display", "flex");
	}
}

function autoStep() {
	if (getSignArea()) {
		//determinar siguiente firma
		autoStepAmount = $(".autoStep").length;
		autoStepinProgress = 1;
		autoStepCurrent = 0;
		nextSign();
	} else {
		$("#actionTable").fadeOut("fast");
		$("#AlertLicense").fadeIn("fast").css("display", "flex");
	}
}

function nextSign() {
	//count a interventores firma 
	//si es mayor a 0 llamar a callSignPad

	autoStepAmount = $(".autoStep").length;
	console.log("🚀 ~ file: firma.js:386 ~ nextSign ~ autoStepAmount:", autoStepAmount)
	if (autoStepAmount > 0) {
		callSignPad();
	} else {
		$("#autoStep").hide();
		autoStepinProgress = 0;
	}
}

function cancelarFirma() {
	autoStepinProgress = 0;
	padResponse = 1;
	hideChooseSign();
	$("#myModal").fadeOut("fast");
	$("#actionTable").fadeIn("fast");
}

function callSignPad() {
	if ($("#chooseSign").length) {
	} else {
		showChooseSign();
	}
	pruebaX = $("#chooseSign").position().left;
	pruebaY = $("#chooseSign").position().top;

	console.log("🚀 ~ callSignPad ~ autoStepinProgress:", autoStepinProgress)
	if (autoStepinProgress == 0) {
		//Si solo hay 1 interventor con firmal libre habilitada, cargar idxInterventor con el interventor que tiene firma libre habilitada
		console.log("🚀 ~ callSignPad ~ vecInterventoresFirmaLibre:", vecInterventoresFirmaLibre)
		if (vecInterventoresFirmaLibre.length === 1 ) {
			const idxInterventor = vecInterventoresFirmaLibre[0].indexInterventor

			//Obtener nombre de interventor que esta firmando
			const interventorNombre = documento.SDTGestionConf.GestionInterventor[idxInterventor].GestionInterventorNombre
			$(`#interventorNombre`).text(`Firma de: ${interventorNombre}`)
		}else{
			//Si hay mas de 1 interventor con firma libre habilitada, agregamos un selection para que el usuario seleccione el interventor que esta firmando
			$(`#interventorNombre`).hide()
			$(`#interventorSelectWrapper`).remove()
			$(`#myModal > .modal-content`).prepend(`
				<div id="interventorSelectWrapper" style="text-align: center;">
					<p>Seleccione el interventor que esta firmando</p>
					<select id="interventorSelect" class="form-control" style="margin-bottom: 10px;">
						${vecInterventoresFirmaLibre.map((interventor,idx) => (
							`<option value="${idx}">${interventor.GestionInterventorNombre}</option>`
						))}
					</select>
				</div>
			`)
		}





		var top = $("#chooseSign").attr("top");
		var left = $("#chooseSign").attr("left");
		signx = $("#chooseSign").offset().left;
		signy = $("#chooseSign").offset().top;
		pruebaX = $("#chooseSign").position().left;
		pruebaY = $("#chooseSign").position().top;
		console.log("top:" + top);
		console.log("left:" + left);
		console.log("signx:" + signx);
		console.log("signy:" + signy);
		console.log("pruebaX:" + pruebaX);
		console.log("pruebaY:" + pruebaY);

		

		//Sacar scerenshot de pagina activa
		// When the user clicks the button, open the modal
		document.getElementById("imgParte").style.backgroundImage = null; //AGREGAR DESPUES ALGUN MENSAJE DE CARGA DE FIRMA

		hideChooseSign();
		getScreenshotOfElement($(`.canvasPage-${PDFViewerApplication.page}`).get(0), signx, signy, 400, 200, function (data) {
			$("#imgParte").attr("src", "data:image/png;base64," + data);
			var modal = document.getElementById("myModal");
			$("#myModal").css("display", "flex");
			

			
			// $('#chooseSign').show();
			showChooseSign();
			//modal.style.display = "block";
			hideChooseSign();
		});

	} else {
		//Todos los datos de posicion de autostep estaran en el SDTFirma



		var top = $(".autoStep:first").attr("top");
		var left = $(".autoStep:first").attr("left");
		const autoStepPage = $(".autoStep:first").attr("autostep-page");
		const autoStepInterventorIdx = $(".autoStep:first").attr("autostep-interventor-idx");
		
		signx = $(".autoStep:first").offset().left;
		console.log("🚀 ~ file: firma.js:431 ~ callSignPad ~ signx:", signx)
		signy = $(".autoStep:first").offset().top;
		console.log("🚀 ~ file: firma.js:433 ~ callSignPad ~ signy:", signy)
		pruebaX = $(".autoStep:first").position().left;
		console.log("🚀 ~ file: firma.js:435 ~ callSignPad ~ pruebaX:", pruebaX)
		pruebaY = $(".autoStep:first").position().top;
		console.log("🚀 ~ file: firma.js:437 ~ callSignPad ~ pruebaY:", pruebaY)

		//Obtener nombre de interventor que esta firmando
		const interventorNombre = documento.SDTGestionConf.GestionInterventor[autoStepInterventorIdx].GestionInterventorNombre
		$(`#interventorNombre`).text(`Firma de: ${interventorNombre}`)


		

		$("body,html").animate(
			{
				scrollTop: $(".autoStep:first").offset().top,
			},
			800 //speed
		);



		// When the user clicks the button, open the modal
		document.getElementById("imgParte").style.backgroundImage = null; //AGREGAR DESPUES ALGUN MENSAJE DE CARGA DE FIRMA

		hideChooseSign();
		getScreenshotOfElement($(`.canvasPage-${autoStepPage}`).get(0), signx, signy, 400, 200, function (data) {
			$("#imgParte").attr("src", "data:image/png;base64," + data);
			var modal = document.getElementById("myModal");
			$("#myModal").css("display", "flex");
			
			
			// $('#chooseSign').show();
			showChooseSign();
			//modal.style.display = "block";
			hideChooseSign();
		});
	}
	
}

function getScreenshotOfElement(element, posX, posY, width, height, callback) {
	// element = document.querySelector(`.canvasPage-${PDFViewerApplication.page}`);



	html2canvas(element, {
		width: width,
		height: height,
		x: signx + 10,
		y: signy,
		scale: 1,
		useCORS: true,
		taintTest: false,
		allowTaint: false,
	}).then(function (canvas) {
		var context = canvas.getContext("2d");
		var imageData = context.getImageData(0, 0, width, height).data;
		console.log("🚀 ~ file: firma.js:498 ~ getScreenshotOfElement ~ capturedCanvas:", capturedCanvas)
		capturedCanvas = document.createElement("canvas");
		var outputContext = capturedCanvas.getContext("2d");
		capturedCanvas.width = width;
		capturedCanvas.height = height;

		var idata = outputContext.createImageData(width, height);
		idata.data.set(imageData);
		outputContext.putImageData(idata, 0, 0);
		callback(capturedCanvas.toDataURL().replace("data:image/png;base64,", ""));
	});
}

function crop(can, a, b) {
	// get your canvas and a context for it
	var ctx = can.getContext("2d");

	// get the image data you want to keep.
	var imageData = ctx.getImageData(a.x, a.y, b.x, b.y);

	// create a new cavnas same as clipped size and a context
	var newCan = document.createElement("canvas");
	newCan.width = b.x - a.x;
	newCan.height = b.y - a.y;
	var newCtx = newCan.getContext("2d");

	// put the clipped image on the new canvas.
	newCtx.putImageData(imageData, 0, 0);

	return newCan;
}

function getvalenc() {
	var valenc = "a";
	valenc = valenc + "13";
	valenc = valenc + "B";
	valenc = valenc + "p";
	valenc = valenc + "1";
	valenc = valenc + "r";
	valenc = valenc + "t";
	valenc = valenc + "C";
	valenc = valenc + "11";
	valenc = valenc + "a";
	valenc = valenc + "1";
	valenc = valenc + "t";
	valenc = valenc + "u";
	valenc = valenc + "1719";
	valenc = valenc + "g";
	valenc = valenc + "1";
	valenc = valenc + "j";
	valenc = valenc + "11";
	valenc = valenc + "b";
	valenc = valenc + "i";
	valenc = valenc + "Vh";
	valenc = valenc + "1";
	valenc = valenc + "m";
	valenc = valenc + "zx";
	return valenc;
}

function getSignArea() {
	try {
		var signArea = false;
		var valsign = CryptoJS.AES.decrypt(licdata, getvalenc()).toString(CryptoJS.enc.Utf8);
		// console.log(licdata);
		var a = Number(
			valsign.substring(4990, 4990 + 1) +
				valsign.substring(2580, 2580 + 1) +
				valsign.substring(1746, 1746 + 1) +
				valsign.substring(4074, 4074 + 1)
		);
		var b = Number(valsign.substring(365, 365 + 1) + valsign.substring(1900, 1900 + 1)) - 1;
		var c = Number(valsign.substring(2981, 2981 + 1) + valsign.substring(1150, 1150 + 1));
		var signRRLL = new Date(a, b, c);
		console.log(
			"a: " +
				valsign.substring(4990, 4990 + 1) +
				valsign.substring(2580, 2580 + 1) +
				valsign.substring(1746, 1746 + 1) +
				valsign.substring(4074, 4074 + 1)
		);
		console.log("b: " + valsign.substring(365, 365 + 1) + valsign.substring(1900, 1900 + 1));
		console.log("c: " + valsign.substring(2981, 2981 + 1) + valsign.substring(1150, 1150 + 1));
		e_d_dmy = +c.toString() + "/" + (b + 1).toString() + "/" + a.toString();
		var SIGN54 = new Date();
		e_d = signRRLL;
		if (signRRLL >= SIGN54) {
			signArea = true;
		}
		return signArea;
	} catch (error) {}
}

function hideChooseSign() {
	console.log("hide chooseSign");
	$("#chooseSign").remove();
}

function showChooseSign() {
	console.log("show chooseSign");

	//buscar pargina activa 
	console.log("🚀 ~ file: firma.js:640 ~ showChooseSign ~ PDFViewerApplication.page:", PDFViewerApplication.page)

	//Scroll de viewerContainer
	let topPagina = window.getViewerContainerScroll()

	//Si la pagina es mayor a 0 debo calcular el height de las paginas anteriores
	// para restarlo al topPagina y asi posicionar el chooseSign en la pagina correcta
	const heightPaginasAnteriores = window.getHeightPaginasAnteriores(PDFViewerApplication.page)
	console.log("🚀 ~ file: firma.js:656 ~ showChooseSign ~ heightPaginasAnteriores:", heightPaginasAnteriores)
	topPagina = topPagina - heightPaginasAnteriores < 0 ? 0 : topPagina - heightPaginasAnteriores


	$(`.canvasPage-${PDFViewerApplication.page}`).prepend(
		`<div id="chooseSign"  style="width:400px;height:200;position:absolute;top:10;left: 0;border-style: solid;background:rgba(0,0,0,0.1);"><p class="chooseSign-text">Área a firmar...</p><div id="AccionesSign"><button id="OKSign" class="actionDivSign"><i data-feather="check-circle"></i></button><button id="CancelSign" class="actionDivSign"><i data-feather="x-circle"></i></button></div></div>`
	);
	$("#chooseSign").css({ top: topPagina + "px", left: "0px", "z-index": 9998 });
	var sigTimer = 0;

	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		//$(document).off("touchend" , "#chooseSign", function(){});
		document.querySelector("#chooseSign").addEventListener("touchend", function () {
			if (sigTimer == 0) {
				sigTimer = 1;
				sigTimer = setTimeout(function () {
					sigTimer = 0;
				}, 600);
			} else {
				callSignPad();
				sigTimer = 0;
			}
		});
	} else {
		$("#chooseSign").click(function () {
			console.log("timer:" + sigTimer);
			if (sigTimer == 0) {
				sigTimer = 1;
				sigTimer = setTimeout(function () {
					sigTimer = 0;
				}, 600);
			} else {
				console.log("LLAMO SIGNPAD:" + sigTimer);
				callSignPad();
				sigTimer = 0;
			}
		});
	}

	$(function () {
		console.log(`canvasPage-${PDFViewerApplication.page}`)
		$("#chooseSign").draggable({
			containment: `.canvasPage-${PDFViewerApplication.page}`,
			start: function () {},
			drag: function () {},
			stop: function () {
				signx = $("#chooseSign").offset().left;
				signy = $("#chooseSign").offset().top;
			},
		});
	});

	$("#OKSign").click(function () {
		callSignPad();
	});

	$("#CancelSign").click(function () {
		cancelarFirma();
	});

	feather.replace();
}

function getDeviceType() {
	//Tablet T Phone P Desktop T
	const ua = navigator.userAgent;

	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
		console.log("TABLET");
		return "T";
	} else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
		console.log("CELULAR");
		return "P";
	}
	console.log("ESCRITORIO");
	return "D";
}

function getOrientation() {
	console.log("getOrientation:" + window.orientation);
	switch (window.orientation) {
		case -90:
		case 90:
			//alert('landscape');
			$("#orientationDiv").remove();
			$("body").css("overflow", "auto");
			break;
		default:
			/* Device is in portrait mode */
			//alert('portrait');
			showOrientationDiv();
	}
}

function showOrientationDiv() {
	$("body").append(
		'<div id="orientationDiv"><img class="orientationIMG" src="/assets/images/rotate-phone.png" ><p>Coloque el dispositivo en posicion horizontal.</p></div>'
	);
	$("body").css("overflow", "hidden");
	window.scrollTo(0, -50);
}

async function obtenerDatosInterface() {
	try {
		const req = {
			Params,
		};
		const res = await axios.post(getDocData, req);
		console.log(`res `, res.data);
		$("#headerTitulo").text(res.data.GestionNombre);
		$("#headerCliente").text(`Cliente #${res.data.ClienteNro}`);
		const fechaHoyConFormato = obtenerFechaHoyConFormato();
		$("#headerFecha").text(fechaHoyConFormato);
	} catch (error) {
		console.log(`error `, error);
	}
}

function obtenerFechaHoyConFormato() {
	const fecha = new Date();

	const dia = String(fecha.getDate()).padStart(2, "0"); // Obtiene el día y lo formatea a dos dígitos
	const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // El mes se indexa desde 0, por eso sumamos 1
	const año = fecha.getFullYear(); // Obtiene el año de forma completa

	return `${dia}/${mes}/${año}`;
}



function mockDivsAutostep() {
  console.log(
    "🚀 ~ file: firma.js:713 ~ mockDivsAutostep ~ mockDivsAutostep: ",
    PDFViewerApplication.pagesCount
  );
  const SDTGestionConf = documento?.SDTGestionConf;
  console.log("🚀 ~ mockDivsAutostep ~ SDTGestionConf:", SDTGestionConf);
  if (SDTGestionConf) {
    $("#autoStep").hide();
	$("#addFirma").hide();

    //Si no tiene interventores va a ser firma libre por defecto
	if (SDTGestionConf.GestionInterventor.length == 0) {
		$("#addFirma").show();
	}

    //Recorremos los interventores
    SDTGestionConf.GestionInterventor.forEach(
      (interventor, indexInterventor) => {
        console.log(`interventor `, interventor);

        if (interventor.GestionInterventorFirmaLibre) {
			//Cargo los interventores que tienen habilitada la firma libre
			vecInterventoresFirmaLibre.push({
				GestionInterventorId: interventor.GestionInterventorId,
                GestionInterventorNombre: interventor.GestionInterventorNombre,
				indexInterventor
			});
          $("#addFirma").show();
        }

        //recorro GestionFirma Y uso GestionFirmaX, GestionFirmaY para crear los divs de autostep numerados
        interventor.GestionFirma.forEach((firma, idxFirma) => {
          $("#autoStep").show();

          console.log("🚀 ~ interventor.GestionFirma.forEach ~ firma:", firma);

          $(`.canvasPage-${firma.GestionFirmaHojaNro}`).prepend(
            `<div class="autoStep" autostep-page="${firma.GestionFirmaHojaNro}" autostep-interventor-idx="${indexInterventor}" 
				autostep-firma-idx="${idxFirma}"
				style="position: absolute;border:1px solid red;top: ${firma.GestionFirmaY}px; left: ${firma.GestionFirmaX}px;width: 400px;height: 200px;z-index:2;"></div>`
          );
        });
      }
    );
  }
}

export {iniciarFirma}