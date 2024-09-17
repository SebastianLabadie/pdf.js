const ENV_BASE_URL ="https://0d31-190-64-71-173.ngrok-free.app/ICIDOCJavaOracle/";
// const ENV_BASE_URL ="http://1.1.9.126:8080/ICIDOC/";
const ENV_documentGetURL = "servlet/apsign0002?";
const ENV_documentSaveUrl = "ApiGestion/setDocument";
const ENV_documentSendToPAD = "servlet/apsign0003?";
const ENV_documentGetFromPAD = "servlet/apsign0004?";
const ENV_documentPcToPAD = "servlet/apsign0005?";
const ENV_decryptURLParams = "servlet/apsigndecrypt?";
const ENV_documentDataInterface = "rest/pSign0006";
// const #signature Configuration
const ENV_signatureManualWhenAutoStep = 1;
const ENV_signatureAskEachWhenAutoStep = 1;
const ENV_signatureMinAmount = 0;
const ENV_signatureMaxAmount = 0;
// const #display Configuration
const ENV_askLandscapeinPhones = 1;
const ENV_forceLandscapeinPhones = 0;
// const #licencia
const ENV_license =
  "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";
let Params = "";

let getDocURL = ENV_BASE_URL + ENV_documentGetURL;
let saveDocURL = ENV_BASE_URL + ENV_documentSaveUrl;
let documento = null;

if (window.location.search.slice(1).search("Params") == -1) {
  Params = window.location.search.slice(1);
} else {
  let params = window.location.search.slice(1).split("&");
  console.log("params:" + params);
  for (let p = 0; p < params.length; p++) {
    let nv = params[p].split("=");
    let name = nv[0],
      value = nv[1];
    if (name == "Params") {
      //Cargar EmpresaId
      Params = "Params=" + value;
    }
  }
}

async function obtenerDocumento() {
  if (documento) {
    return documento;
  }

  try {
    console.log("🚀 ~ file: firma.js:708 ~ obtenerDocumento ~ Params:", Params);
    console.log(
      "🚀 ~ file: firma.js:708 ~ obtenerDocumento ~ getDocURL:",
      getDocURL
    );
    console.log(`obtenerDocumento `, documento);
    const response = await axios.get(
      `${ENV_BASE_URL}ApiGestion/List?Linkguid=${Params}`,{
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    console.log("🚀 ~ obtenerDocumento ~ response:", JSON.stringify(response.data).substring(0,100))


    documento = response.data;

    return response.data;
  } catch (error) {
    // Manejar errores si es necesario
    console.error('error obtenerDocumento ',error);
  }
}

function guardarDocumento(SDTFirmaGuardar) {
  return axios.post(
    saveDocURL,
    { linkGUID: Params, Firmas: SDTFirmaGuardar },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

async function guardarImagen(Imagen) {
  return axios.post(
    `${ENV_BASE_URL}ApiGestion/setImage`,
    { linkGUID: Params, Imagen },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

async function enviarPin(request) {
  try {
    const res = await axios.post(
      `${ENV_BASE_URL}ApiGestion/createPin`,
      request,
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("🚀 ~ enviarPin ~ error:", error);
  }

  return null;
}

async function validarPin(request) {
  try {
    const res = await axios.post(
      `${ENV_BASE_URL}ApiGestion/validatePin`,
      request,
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("🚀 ~ validarPin ~ error:", error);
  }

  return null;
}

function toastError(message) {
	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": false,
		"progressBar": true,
		"positionClass": "toast-top-right",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "1000",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000"
	  }

	  toastr.error(message,'Error')
}

window.getViewerContainerScroll = function getViewerContainerScroll() {
  //console.log(`getPositionPage ${page}`);
  // Obtén una referencia al elemento div que deseas analizar
  const divContenedor = document.querySelector("#viewerContainer");
  const top = divContenedor.scrollTop;

  return divContenedor.scrollTop;
};

window.getHeightPaginasAnteriores = function getHeightPaginasAnteriores(page) {
  console.log(
    "🚀 ~ file: firmaUtils.js:86 ~ getHeightPaginasAnteriores ~ page:",
    page
  );
  let height = 0;
  if (page > 1) {
    for (let index = page; index > 1; index--) {
      // PDFViewerApplication.pdfDocument.getPage(index).then(function (page) {
      // 	console.log(`page `,page.getViewport({ scale: 1 }));
      // 	height = height + page.getViewport({ scale: 1 }).height;
      // })
      height += document.querySelector(`.canvasPage-${index}`).offsetHeight;
    }
  }
  return height;
};

function base64ToBlob(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; ++i) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes; //new Blob([bytes], { type: 'application/pdf' });
}

export {
  ENV_BASE_URL,
  ENV_documentGetURL,
  ENV_documentSaveUrl,
  ENV_documentSendToPAD,
  ENV_documentGetFromPAD,
  ENV_documentPcToPAD,
  ENV_decryptURLParams,
  ENV_documentDataInterface,
  ENV_signatureManualWhenAutoStep,
  ENV_signatureAskEachWhenAutoStep,
  ENV_signatureMinAmount,
  ENV_signatureMaxAmount,
  ENV_askLandscapeinPhones,
  ENV_forceLandscapeinPhones,
  ENV_license,
  obtenerDocumento,
  guardarDocumento,
  base64ToBlob,
  enviarPin,
  validarPin,
  toastError,
  guardarImagen
};
