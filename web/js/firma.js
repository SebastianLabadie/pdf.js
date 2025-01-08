// Import statements
import {
  ENV_license,
  enviarPin,
  guardarDocumento,
  guardarImagen,
  obtenerDocumento,
  toastError,
  validarPin,
} from "./firmaUtils.js";

// Global variables and constants
const SignaturePad = window.SignaturePad;

let e_d = ""; // License expiration date
let e_d_dmy = "";
let autoStepAmount = 0;
let autoStepinProgress = 0;
let pruebaY = 0;
let pruebaX = 0;
const licdata = ENV_license;
const a_d = new Date();
let signx = 0;
let signy = 0;
let documento = null;
let capturedCanvas = null;
window.signaturecount = 0;

const vecInterventoresFirmaLibre = [];
const SDTFirmaGuardar = [];
const coordenadasFirma = { lat: 0, lng: 0 };

/**
 * Main function to initiate the signing process.
 */
async function iniciarFirma() {
  console.log("🚀 Starting signature process");

  // Hide all popups
  hideAllPopups();

  // Load the document
  documento = await obtenerDocumento();

  // Prepare signature areas if any
  setupSignatureAreas();

  // Handle license information and display if necessary
  handleLicenseInfo();

  // Validate older device
  subscribeToOrientationChanges();

  // Initialize the signature pad
  const signaturePad = initializeSignaturePad();

  // Setup event listeners for the signature pad
  setupSignaturePadEvents(signaturePad);

  // Show action buttons
  showActionButtons();

  // Setup click handlers for various buttons
  setupClickHandlers();
}

/**
 * Hides all popups on the page.
 */
function hideAllPopups() {
  $("#FinishModal, #AlertModal, #AlertLicense, #PadModal, #PinModal").hide();
}

/**
 * Prepares the signature areas based on the document configuration.
 */
function setupSignatureAreas() {
  mockDivsAutostep();
}

/**
 * Handles the display and validation of license information.
 */
function handleLicenseInfo() {
  $("#license-info").click(() => {
    $("#LicenseInfoPopup").fadeIn("fast").css("display", "flex");
    $("#actionTable").fadeOut("fast");
  });

  $(".closeLicenseInfoPopup").click(() => {
    $("#LicenseInfoPopup").fadeOut("fast");
    $("#actionTable").fadeIn("fast");
  });

  if (!validateLicense()) {
    //   displayLicenseExpired();
  }
}

// Subscribe to orientation changes
function subscribeToOrientationChanges() {
  const validateOnOrientationChange = event => {
    console.log(
      "🚀 ~ subscribeToOrientationChanges ~ validateOnOrientationChange: validateOnOrientationChange"
    );
    const angle = event.target.angle; // Get the rotation angle
    if (angle === 90 || angle === -90) {
      console.log(
        "subscribeToOrientationChanges ~ Landscape mode detected (angle: " +
          angle +
          "). Skipping validation."
      );
      hideOrientationDiv();
      return;
    }

    const isOlder = isOlderDevice(event);
    console.log(
      isOlder
        ? "🚀 ~ subscribeToOrientationChanges ~ isOlder: Older device detected!"
        : "🚀 ~ subscribeToOrientationChanges ~ isOlder: Modern device or skipped due to landscape!"
    );
    if (isOlder) {
      showOrientationDiv();
    }
  };

  if (screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener("change", event => {
      const type = event.target.type;
      const angle = event.target.angle;
      console.log(`ScreenOrientation change: ${type}, ${angle} degrees.`);
      validateOnOrientationChange(event);
    });
  }

  // Initial validation
  if (screen.orientation) {
    const angle = screen.orientation.angle || 0; // Initial orientation angle
    if (angle === 90 || angle === -90) {
      console.log(
        "subscribeToOrientationChanges ~ Landscape mode detected on load (angle: " +
          angle +
          "). Skipping validation."
      );
      hideOrientationDiv();
    } else {
      const isOlder = isOlderDevice();
      console.log(
        isOlder
          ? "subscribeToOrientationChanges ~ Older device detected!"
          : "subscribeToOrientationChanges ~ Modern device detected!"
      );
      if (isOlder) {
        showOrientationDiv();
      }
    }
  } else {
    // Fallback for unsupported environments
    const isLandscape = window.innerWidth > window.innerHeight;
    if (!isLandscape) {
      const isOlder = isOlderDevice();
      console.log(
        isOlder
          ? "subscribeToOrientationChanges ~ Older device detected!"
          : "subscribeToOrientationChanges ~ Modern device detected!"
      );
      if (isOlder) {
        showOrientationDiv();
      } else {
        hideOrientationDiv();
      }
    }
  }
}

/**
 * Checks if the device is an older device based on viewport size and user-agent.
 * @returns {boolean} True if the device is an older device, false otherwise.
 */
function isOlderDevice() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  console.log("🚀 ~ isOlderDevice ~ width:", width);
  console.log("🚀 ~ isOlderDevice ~ height:", height);

  // Check if viewport is smaller than 360x640
  const isSmallViewport = width < 360; // || height < 640;
  console.log("🚀 ~ isOlderDevice ~ isSmallViewport:", isSmallViewport);

  // User-Agent detection for older devices
  const userAgent = navigator.userAgent.toLowerCase();
  const olderDevices = [
    /iphone\s?4|iphone\s?5/i, // iPhone 4/5
    /android\s?2|android\s?3|android\s?4/i, // Early Android versions
    /windows\s?phone/i, // Windows Phones
    /blackberry|bb10/i, // BlackBerry
    /nokia/i, // Older Nokia devices
  ];

  // Check if the user-agent matches any older device patterns
  const isOlderUserAgent = olderDevices.some(device => userAgent.match(device));

  // Return true if either condition matches and not in landscape
  return isSmallViewport || isOlderUserAgent;
}

function showOrientationDiv() {
  $("body").append(
    '<div id="orientationDiv"><img class="orientationIMG" src="images/rotate-phone.png" ><p>Coloque el dispositivo en posicion horizontal.</p></div>'
  );
  $("body").css("overflow", "hidden");
  window.scrollTo(0, -50);
}

function hideOrientationDiv() {
  $("#orientationDiv").remove();
  $("body").css("overflow", "visible");
}

/**
 * Validates the license and updates related UI elements.
 * @returns {boolean} True if the license is valid, false otherwise.
 */
function validateLicense() {
  getSignArea();
  $(".license-expiration-date").html(e_d_dmy);

  if (e_d < a_d) {
    $(".license-status").html("EXPIRADA").addClass("license-error");
    $(".license-expiration-date").addClass("license-next-to-expire");
    return false;
  }

  const daysDiff = calculateDaysDifference(e_d, a_d);

  if (daysDiff <= 0) {
    displayLicenseExpired();
    return false;
  } else if (daysDiff < 16) {
    displayLicenseExpiringSoon();
  }

  return true;
}

/**
 * Calculates the difference in days between two dates.
 * @param {Date} endDate
 * @param {Date} startDate
 * @returns {number} Number of days difference.
 */
function calculateDaysDifference(endDate, startDate) {
  const endTimestamp = new Date(endDate).getTime();
  const startTimestamp = startDate.getTime();
  const microSecondsDiff = endTimestamp - startTimestamp;
  return Math.floor(microSecondsDiff / (1000 * 60 * 60 * 24));
}

/**
 * Displays the license expired message and hides action buttons.
 */
function displayLicenseExpired() {
  $(".next-to-expire").css("display", "block").html("Licencia expirada");
  $(".license-expiration-date").addClass("red");
  $("#actionTable").fadeOut("fast");
  $("#LicenseInfoPopup").fadeIn("fast").css("display", "flex");
}

/**
 * Displays a warning if the license is expiring soon.
 */
function displayLicenseExpiringSoon() {
  if ($.cookie("nextToExpire")) {
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

/**
 * Initializes the signature pad.
 * @returns {SignaturePad} The initialized signature pad.
 */
function initializeSignaturePad() {
  return new SignaturePad(document.getElementById("signature-pad"), {
    backgroundColor: "rgba(255, 255, 255, 0)",
    penColor: "rgb(0, 0, 0)",
    minWidth: 0.5,
    maxWidth: 1.5,
    throttle: 8,
    minDistance: 1,
  });
}

/**
 * Sets up event listeners for the signature pad buttons.
 * @param {SignaturePad} signaturePad
 */
function setupSignaturePadEvents(signaturePad) {
  const saveButton = document.getElementById("save");
  const cancelButton = document.getElementById("clear");

  saveButton.addEventListener("click", () => handleSaveSignature(signaturePad));
  cancelButton.addEventListener("click", () =>
    handleCancelSignature(signaturePad)
  );
}

/**
 * Handles saving the signature and placing it on the document.
 * @param {SignaturePad} signaturePad
 */
function handleSaveSignature(signaturePad) {
  console.log("🚀 ~ handleSaveSignature ~ signaturePad:", signaturePad);

  if (signaturePad.isEmpty()) {
    displayAlert("Por favor dibuje su firma antes de continuar", "warning");
    return;
  }

  const padData = signaturePad.toData();
  const padImage = signaturePad.toDataURL("image/png");
  const padSVG = signaturePad.toSVG();

  window.signaturecount += 1;
  let pagina, GestionFirmaHojaId, GestionFirmaId, GestionInterventorId;

  if (autoStepinProgress === 1) {
    ({ pagina, GestionFirmaHojaId, GestionFirmaId, GestionInterventorId } =
      getAutoStepSignatureData());
  } else {
    ({ pagina, GestionFirmaHojaId, GestionFirmaId, GestionInterventorId } =
      getManualSignatureData());
  }

  appendSignatureToPage(pagina, padImage);
  saveSignatureData(
    pagina,
    padData,
    padSVG,
    GestionFirmaHojaId,
    GestionFirmaId,
    GestionInterventorId
  );
  closeSignatureModal(signaturePad);

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      coordenadasFirma.lat = position.coords.latitude;
      coordenadasFirma.lng = position.coords.longitude;
    });
  }
}

/**
 * Retrieves signature data for autostep signatures.
 * @returns {object} Signature data.
 */
function getAutoStepSignatureData() {
  const idxInterventor = $(".autoStep:first").attr("autostep-interventor-idx");
  const idxFirma = $(".autoStep:first").attr("autostep-firma-idx");
  const pagina = $(".autoStep:first").attr("autostep-page");

  const interventor =
    documento.SDTGestionConf.GestionInterventor[idxInterventor];
  const firma = interventor.GestionFirma[idxFirma];

  return {
    pagina,
    GestionFirmaHojaId: firma.GestionFirmaHojaId,
    GestionFirmaId: firma.GestionFirmaId,
    GestionInterventorId: interventor.GestionInterventorId,
  };
}

/**
 * Retrieves signature data for manual signatures.
 * @returns {object} Signature data.
 */
function getManualSignatureData() {
  const pagina = PDFViewerApplication.page;
  let GestionInterventorId;

  if (vecInterventoresFirmaLibre.length === 1) {
    GestionInterventorId = vecInterventoresFirmaLibre[0].GestionInterventorId;
  } else {
    const interventorSelected = $("#interventorSelect").val();
    GestionInterventorId =
      vecInterventoresFirmaLibre[interventorSelected].GestionInterventorId;
  }

  return {
    pagina,
    GestionFirmaHojaId: "00000000-0000-0000-0000-000000000000",
    GestionFirmaId: "00000000-0000-0000-0000-000000000000",
    GestionInterventorId,
  };
}

/**
 * Appends the signature image to the specified page.
 * @param {number} pagina
 * @param {string} padImage
 */
function appendSignatureToPage(pagina, padImage) {
  const signatureId = `signature${window.signaturecount}`;
  $(`.canvasPage-${pagina}`).append(
    `<div><img id="${signatureId}" draggable="false" style="user-select: none;" /></div>`
  );

  const scaleFactor = parseFloat(
    document.querySelector("#viewer").style.getPropertyValue("--scale-factor")
  );
  const adjustedX = pruebaX / scaleFactor;
  const adjustedY = pruebaY / scaleFactor;

  $(`#${signatureId}`)
    .css({
      top: `calc(var(--scale-factor) * ${adjustedY}px)`,
      left: `calc(var(--scale-factor) * ${adjustedX}px)`,
      position: "absolute",
      width: "calc(var(--scale-factor) * 400px)",
      height: "calc(var(--scale-factor) * 200px)",
    })
    .attr({ src: padImage });
}

/**
 * Saves the signature data for later processing.
 */
function saveSignatureData(
  pagina,
  padData,
  padSVG,
  GestionFirmaHojaId,
  GestionFirmaId,
  GestionInterventorId
) {
  const signatureElement = document.querySelector(
    `#signature${window.signaturecount}`
  );
  const canvasPage = document.querySelector(`.canvasPage-${pagina}`);

  SDTFirmaGuardar.push({
    GestionFirmaData: padData,
    GestionFirmaImg: padSVG,
    GestionFirmaX: pruebaX,
    GestionFirmaY: pruebaY,
    GestionFirmaWidth: signatureElement.offsetWidth,
    GestionFirmaHeight: signatureElement.offsetHeight,
    GestionFirmaHojaNro: pagina,
    GestionHojaWidth: canvasPage.offsetWidth,
    GestionHojaHeight: canvasPage.offsetHeight,
    GestionFirmaFecha: Date.now().toString(),
    GestionFirmaHojaId,
    GestionFirmaId,
    GestionInterventorId,
  });
}

/**
 * Closes the signature modal and clears the signature pad.
 * @param {SignaturePad} signaturePad
 */
function closeSignatureModal(signaturePad) {
  $("#myModal").hide();
  signaturePad.clear();
  $("#actionTable").fadeIn("fast");

  if (autoStepinProgress === 1) {
    $(".autoStep:first").remove();
    nextSign();
  }
}

/**
 * Handles cancellation of the signature.
 * @param {SignaturePad} signaturePad
 */
function handleCancelSignature(signaturePad) {
  signaturePad.clear();
  autoStepinProgress = 0;
}

/**
 * Shows action buttons based on the document configuration.
 */
function showActionButtons() {
  $("#guardarPDF").show();

  if (
    documento.SDTGestionConf.GestionInterventor.some(
      interventor => interventor.Imagenes.length > 0
    )
  ) {
    $("#btnImagenes").show();
  }
}

/**
 * Sets up click handlers for various buttons.
 */
function setupClickHandlers() {
  $("#addFirma").click(AddFirma);
  $("#autoStep").click(autoStep);
  $("#cancelar").click(cancelarFirma);
  $("#OKSign").click(callSignPad);
  $("#CancelSign").click(cancelarFirma);
  $("#guardarPDF").click(guardarPDF);
  $("#btnImagenes").click(showModalImagenes);
  $("#closeModalImagenes").click(() => {
    $("#ModalImagenes").fadeOut("fast");
    $("#toolbarContainer").css("display", "block");
  });
}

/**
 * Initiates the process of adding a signature.
 */
function AddFirma() {
  if (getSignArea()) {
    showChooseSign();
    $("#actionTable").fadeOut("fast");
    $(document).keyup(e => {
      if (
        e.keyCode === 27 &&
        ($("#chooseSign").is(":visible") || $("#myModal").is(":visible"))
      ) {
        cancelarFirma();
      }
    });
  } else {
    $("#actionTable").fadeOut("fast");
    $("#AlertLicense").fadeIn("fast").css("display", "flex");
  }
}

/**
 * Initiates the autostep signature process.
 */
function autoStep() {
  if (getSignArea()) {
    autoStepAmount = $(".autoStep").length;
    autoStepinProgress = 1;
    nextSign();
  } else {
    $("#actionTable").fadeOut("fast");
    $("#AlertLicense").fadeIn("fast").css("display", "flex");
  }
}

/**
 * Proceeds to the next signature in the autostep process.
 */
function nextSign() {
  autoStepAmount = $(".autoStep").length;
  if (autoStepAmount > 0) {
    callSignPad();
  } else {
    $("#autoStep").hide();
    autoStepinProgress = 0;
  }
}

/**
 * Cancels the current signature process.
 */
function cancelarFirma() {
  autoStepinProgress = 0;
  hideChooseSign();
  $("#myModal").fadeOut("fast");
  $("#actionTable").fadeIn("fast");
}

/**
 * Calls the signature pad for capturing the signature.
 */
function callSignPad() {
  if (!$("#chooseSign").length) {
    showChooseSign();
  }

  const scale = parseFloat(
    document.querySelector("#viewer").style.getPropertyValue("--scale-factor")
  );
  pruebaX = $("#chooseSign").position().left;
  pruebaY = $("#chooseSign").position().top;
  console.log(`pruebaX: ${pruebaX}, pruebaY: ${pruebaY}`);

  if (autoStepinProgress === 0) {
    handleManualSignature(scale);
  } else {
    handleAutoStepSignature(scale);
  }
}

/**
 * Handles manual signature positioning and display.
 * @param {number} scale
 */
function handleManualSignature(scale) {
  if (vecInterventoresFirmaLibre.length === 1) {
    const idxInterventor = vecInterventoresFirmaLibre[0].indexInterventor;
    const interventorNombre =
      documento.SDTGestionConf.GestionInterventor[idxInterventor]
        .GestionInterventorNombre;
    $("#interventorNombre").text(`Firma de: ${interventorNombre}`);
  } else {
    displayInterventorSelection();
  }

  updateSignaturePosition();

  getScreenshotOfElement(
    $(`.canvasPage-${PDFViewerApplication.page}`).get(0),
    signx + 10,
    signy,
    400 * scale,
    200 * scale,
    data => {
      $("#imgParte").attr("src", `data:image/png;base64,${data}`);
      $("#myModal").css("display", "flex");
      hideChooseSign();
    }
  );
}

/**
 * Handles autostep signature positioning and display.
 * @param {number} scale
 */
function handleAutoStepSignature(scale) {
  const autoStepPage = $(".autoStep:first").attr("autostep-page");
  const autoStepInterventorIdx = $(".autoStep:first").attr(
    "autostep-interventor-idx"
  );
  const interventorNombre =
    documento.SDTGestionConf.GestionInterventor[autoStepInterventorIdx]
      .GestionInterventorNombre;

  $("#interventorNombre").text(`Firma de: ${interventorNombre}`);

  pruebaX = $(".autoStep:first").position().left;
  pruebaY = $(".autoStep:first").position().top;

  $("body,html").animate({ scrollTop: $(".autoStep:first").offset().top }, 800);

  getScreenshotOfElement(
    $(`.canvasPage-${autoStepPage}`).get(0),
    $(".autoStep:first").offset().left + 10,
    $(".autoStep:first").offset().top,
    400 * scale,
    200 * scale,
    data => {
      $("#imgParte").attr("src", `data:image/png;base64,${data}`);
      $("#myModal").css("display", "flex");
      hideChooseSign();
    }
  );
}

/**
 * Updates the position of the signature area.
 */
function updateSignaturePosition() {
  signx = $("#chooseSign").offset().left;
  signy = $("#chooseSign").offset().top;
  pruebaX = $("#chooseSign").position().left;
  pruebaY = $("#chooseSign").position().top;
}

/**
 * Displays interventor selection dropdown when multiple interventors are available.
 */
function displayInterventorSelection() {
  $("#interventorNombre").hide();
  $("#interventorSelectWrapper").remove();
  const options = vecInterventoresFirmaLibre
    .map(
      (interventor, idx) =>
        `<option value="${idx}">${interventor.GestionInterventorNombre}</option>`
    )
    .join("");
  $("#myModal > .modal-content").prepend(`
	  <div id="interventorSelectWrapper" style="text-align: center;">
		<p>Seleccione el interventor que está firmando</p>
		<select id="interventorSelect" class="form-control" style="margin-bottom: 10px;">
		  ${options}
		</select>
	  </div>
	`);
}

/**
 * Takes a screenshot of a specified element area.
 * @param {HTMLElement} element
 * @param {number} posX
 * @param {number} posY
 * @param {number} width
 * @param {number} height
 * @param {Function} callback
 */
function getScreenshotOfElement(element, posX, posY, width, height, callback) {
  html2canvas(element, {
    width,
    height,
    x: posX,
    y: posY,
    scale: 1,
    useCORS: true,
    taintTest: false,
    allowTaint: false,
  }).then(canvas => {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, width, height).data;
    capturedCanvas = document.createElement("canvas");
    const outputContext = capturedCanvas.getContext("2d");
    capturedCanvas.width = width;
    capturedCanvas.height = height;

    const idata = outputContext.createImageData(width, height);
    idata.data.set(imageData);
    outputContext.putImageData(idata, 0, 0);
    callback(capturedCanvas.toDataURL().replace("data:image/png;base64,", ""));
  });
}

function getvalenc() {
  let valenc = "a";
  valenc += "13";
  valenc += "B";
  valenc += "p";
  valenc += "1";
  valenc += "r";
  valenc += "t";
  valenc += "C";
  valenc += "11";
  valenc += "a";
  valenc += "1";
  valenc += "t";
  valenc += "u";
  valenc += "1719";
  valenc += "g";
  valenc += "1";
  valenc += "j";
  valenc += "11";
  valenc += "b";
  valenc += "i";
  valenc += "Vh";
  valenc += "1";
  valenc += "m";
  valenc += "zx";
  return valenc;
}

/**
 * Validates the license and returns whether the signature area is accessible.
 * @returns {boolean} True if accessible, false otherwise.
 */
function getSignArea() {
  try {
    const decryptedLicense = CryptoJS.AES.decrypt(
      licdata,
      getvalenc()
    ).toString(CryptoJS.enc.Utf8);
    // Extracting date components from the decrypted license
    const year = Number(
      decryptedLicense.substring(4990, 4991) +
        decryptedLicense.substring(2580, 2581) +
        decryptedLicense.substring(1746, 1747) +
        decryptedLicense.substring(4074, 4075)
    );
    const month =
      Number(
        decryptedLicense.substring(365, 366) +
          decryptedLicense.substring(1900, 1901)
      ) - 1;
    const day = Number(
      decryptedLicense.substring(2981, 2982) +
        decryptedLicense.substring(1150, 1151)
    );

    e_d_dmy = `${day}/${month + 1}/${year}`;
    e_d = new Date(year, month, day);

    return e_d >= new Date();
  } catch (error) {
    console.error("Error validating license:", error);
    return false;
  }
}

/**
 * Hides the choose signature area.
 */
function hideChooseSign() {
  $("#chooseSign").remove();
}

/**
 * Shows the choose signature area on the document.
 */
function showChooseSign() {
  const topPagina =
    getViewerContainerScroll() -
    getHeightPaginasAnteriores(PDFViewerApplication.page);
  $(`.canvasPage-${PDFViewerApplication.page}`).prepend(
    `<div id="chooseSign" style="width: calc(var(--scale-factor) * 400px); height: calc(var(--scale-factor) * 200px); position:absolute; top:10px; left:0px; border-style: solid; background:rgba(0,0,0,0.1); z-index:9998;">
		<p class="chooseSign-text">Área a firmar...</p>
		<div id="AccionesSign">
		  <button id="OKSign" class="actionDivSign"><i data-feather="check-circle"></i></button>
		  <button id="CancelSign" class="actionDivSign"><i data-feather="x-circle"></i></button>
		</div>
	  </div>`
  );
  $("#chooseSign").css({ top: `${topPagina}px` });
  setupChooseSignEvents();
  feather.replace();
}

/**
 * Sets up events for the choose signature area.
 */
function setupChooseSignEvents() {
  let sigTimer = 0;
  $("#chooseSign").on("click touchend", function () {
    if (sigTimer === 0) {
      sigTimer = setTimeout(() => {
        sigTimer = 0;
      }, 600);
    } else {
      callSignPad();
      sigTimer = 0;
    }
  });

  $("#chooseSign").draggable({
    containment: `.canvasPage-${PDFViewerApplication.page}`,
    stop: () => {
      signx = $("#chooseSign").offset().left;
      signy = $("#chooseSign").offset().top;
    },
  });

  $("#OKSign").click(callSignPad);
  $("#CancelSign").click(cancelarFirma);
}

/**
 * Retrieves the scroll position of the viewer container.
 * @returns {number} The scroll position.
 */
function getViewerContainerScroll() {
  return $("#viewerContainer").scrollTop();
}

/**
 * Calculates the combined height of pages before the current page.
 * @param {number} currentPage
 * @returns {number} The combined height.
 */
function getHeightPaginasAnteriores(currentPage) {
  let totalHeight = 0;
  for (let i = 1; i < currentPage; i++) {
    totalHeight += $(`.canvasPage-${i}`).height();
  }
  return totalHeight;
}

/**
 * Saves the document with the signatures.
 */
async function guardarPDF() {
  if (window.signaturecount < 1) {
    displayAlert("DEBE INGRESAR UNA FIRMA", "warning");
    return;
  }

  if (!areRequiredImagesUploaded()) {
    displayAlert("Debe cargar las imágenes obligatorias", "warning");
    return;
  }

  const parser = new UAParser(navigator.userAgent);

  // Add additional information to each signature in SDTFirmaGuardar
  SDTFirmaGuardar.forEach(firma => {
    firma.GestionFirmaCoordenadas = coordenadasFirma;
    firma.GestionFirmaUserAgentInfo = parser.getResult();
  });
  console.log(`SDTFirmaGuardar `, SDTFirmaGuardar);

  // Save signatures to the database
  $("#actionTable").fadeOut("fast");
  await guardarDocumento(SDTFirmaGuardar);
  // $("#FinishModal").fadeIn("fast").css("display", "flex");
  displayAlert("DOCUMENTO FIRMADO", "finish");
  // Send message to React Native app if applicable
  sendMessageToApp({ accion: "FINALIZAR" });
}

/**
 * Displays an alert with the specified message.
 * @param {string} message
 */
function displayAlert(message, type = "warning") {
  $("#actionTable").fadeOut("fast");
  $("#msgWarning").text(message);
  $("#AlertModal").fadeIn("fast").css("display", "flex");
  if (type === "warning") {
    $("#iconAlert").html(feather.icons["alert-triangle"].toSvg());
    $("#iconAlert").css("color", "#efce4a");

    setTimeout(() => {
      $("#AlertModal").fadeOut("fast");
      $("#actionTable").fadeIn("fast");
    }, 3000);
  }

  if (type === "finish") {
    $("#iconAlert").html(
      `<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>`
    );
  }
}

/**
 * Checks if all required images have been uploaded.
 * @returns {boolean} True if all required images are uploaded, false otherwise.
 */
function areRequiredImagesUploaded() {
  return documento.SDTGestionConf.GestionInterventor.every(interventor =>
    interventor.Imagenes.every(
      imagen => !imagen.GestionImagenObligatoria || imagen.GestionImagen
    )
  );
}

/**
 * Sends a message to the React Native app if available.
 * @param {object} dataObject
 */
function sendMessageToApp(dataObject) {
  try {
    if (window.ReactNativeWebView) {
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify(dataObject));
      }, 1500);
    }
  } catch (error) {
    console.log("Error sending message to app:", error);
  }
}

/**
 * Mock function to setup signature areas for autostep.
 */
function mockDivsAutostep() {
  const SDTGestionConf = documento?.SDTGestionConf;
  if (SDTGestionConf) {
    $("#autoStep").hide();
    $("#addFirma").hide();

    if (SDTGestionConf.GestionInterventor.length === 0) {
      $("#addFirma").show();
    }

    SDTGestionConf.GestionInterventor.forEach(
      (interventor, indexInterventor) => {
        if (interventor.GestionInterventorFirmaLibre) {
          vecInterventoresFirmaLibre.push({
            GestionInterventorId: interventor.GestionInterventorId,
            GestionInterventorNombre: interventor.GestionInterventorNombre,
            indexInterventor,
          });
          $("#addFirma").show();
        }

        interventor?.GestionFirma?.forEach((firma, idxFirma) => {
          $("#autoStep").show();
          $(`.canvasPage-${parseInt(firma.GestionFirmaHojaNro)}`).prepend(
            `<div class="autoStep" autostep-page="${
              firma.GestionFirmaHojaNro
            }" autostep-interventor-idx="${indexInterventor}" 
			  autostep-firma-idx="${idxFirma}"
			  style="position: absolute; top: calc(var(--scale-factor) * ${parseInt(
          firma.GestionFirmaY
        )}px); left: calc(var(--scale-factor) * ${parseInt(
          firma.GestionFirmaX
        )}px); width: calc(var(--scale-factor) * 400px); height: calc(var(--scale-factor) * 200px); z-index:2;"></div>`
          );
        });
      }
    );

    if (
      SDTGestionConf.GestionInterventor.length === 1 &&
      SDTGestionConf.GestionInterventor[0].GestionInterventorRequierePin
    ) {
      $("#actionTable").hide();
      $("#PinModal").fadeIn("fast").css("display", "flex");
      accionesModalPin();
    }
  }
}

/**
 * Handles PIN modal interactions.
 */
function accionesModalPin() {
  const reqEnviarPin = {
    Empresaid: documento?.SDTGestionConf?.EmpresaId,
    GestionId: documento?.SDTGestionConf?.GestionId,
    GestionInterventorId:
      documento?.SDTGestionConf?.GestionInterventor[0].GestionInterventorId,
    Medio: "",
  };

  let pin = "";

  $("#btnTengoCodigo").click(() => {
    $("#PinModalContent").hide();
    $("#validarpinModalContent").show();
  });

  $("#btnPinWpp, #btnPinEmail, #btnPinSms").click(async function () {
    reqEnviarPin.Medio = $(this).data("medio");
    const res = await enviarPin(reqEnviarPin);
    if (res) {
      $("#PinModalContent").hide();
      $("#validarpinModalContent").show();
    }
  });

  const inputsPin = document.querySelectorAll(".pinDigit");
  inputsPin.forEach((input, key) => {
    input.addEventListener("keyup", () => {
      if (input.value && key < inputsPin.length - 1) {
        inputsPin[key + 1].focus();
      }
    });
  });

  $("#btnVolverAPedirCodigo").click(() => {
    $("#validarpinModalContent").hide();
    $("#PinModalContent").show();
  });

  $("#btnValidarPin").click(async () => {
    pin = Array.from(inputsPin)
      .map(input => input.value)
      .join("");
    const reqValidarPin = {
      Empresaid: documento?.SDTGestionConf?.EmpresaId,
      GestionId: documento?.SDTGestionConf?.GestionId,
      GestionInterventorId:
        documento?.SDTGestionConf?.GestionInterventor[0].GestionInterventorId,
      pin,
    };
    const res = await validarPin(reqValidarPin);
    if (res && res.isOk) {
      $("#PinModal").fadeOut("fast");
      $("#actionTable").show();
    } else {
      toastError(res.ErrorDsc);
    }
  });
}

/**
 * Displays the modal for image management, allowing users to add, view, edit, or delete images.
 */
function showModalImagenes() {
  $("#ModalImagenes").fadeIn("fast").css("display", "flex");
  $("#ModalImagenesContent").empty();

  const grid = $("<div>").addClass("image-grid");

  documento.SDTGestionConf.GestionInterventor.forEach(interventor => {
    interventor.Imagenes.forEach(imagen => {
      const card = $("<div>").addClass("image-card");

      // Display interventor and image names
      card.append(
        $("<div>")
          .addClass("image-info")
          .append(
            $("<span>")
              .addClass("interventor-name")
              .text(interventor.GestionInterventorNombre)
          )
          .append(
            $("<span>").addClass("image-name").text(imagen.GestionImagenNombre)
          )
      );

      const actionsDiv = $("<div>").addClass("image-actions");

      if (!imagen.GestionImagen) {
        // If no image is available, show 'Agregar' button
        actionsDiv.append(
          $("<button>")
            .addClass("customBtn")
            .text("Agregar")
            .click(() => handleImageAction("add", interventor, imagen))
        );
      } else {
        // If image exists, show options to view, edit, or delete
        actionsDiv.append(
          $("<button>")
            .addClass("customBtn")
            .text("Ver")
            .click(() => handleImageAction("view", interventor, imagen))
        );
        actionsDiv.append(
          $("<button>")
            .addClass("customBtn")
            .text("Editar")
            .click(() => handleImageAction("update", interventor, imagen))
        );
        actionsDiv.append(
          $("<button>")
            .addClass("customBtn")
            .text("Eliminar")
            .click(() => handleImageAction("delete", interventor, imagen))
        );
      }

      card.append(actionsDiv);
      grid.append(card);
    });
  });

  $("#ModalImagenesContent").append(grid);
}

/**
 * Handles the different actions (add, view, update, delete) for images.
 * @param {string} action - The action to perform.
 * @param {object} interventor - The interventor object.
 * @param {object} imagen - The image object.
 */
function handleImageAction(action, interventor, imagen) {
  switch (action) {
    case "add":
    case "update":
      handleAddOrUpdate(action, interventor, imagen);
      break;
    case "view":
      if (imagen.GestionImagen) {
        viewImage(imagen);
      } else {
        displayAlert(
          "No hay imagen disponible para ver. Por favor, use la opción 'Agregar'.",
          "warning"
        );
      }
      break;
    case "delete":
      if (imagen.GestionImagen) {
        confirmDeleteImage(imagen);
      } else {
        displayAlert(
          "No hay imagen disponible para eliminar. Por favor, use la opción 'Agregar'.",
          "warning"
        );
      }
      break;
    default:
      console.error(`Acción no válida: ${action}`);
  }
}

/**
 * Handles adding or updating an image.
 * @param {string} action - 'add' or 'update'.
 * @param {object} interventor - The interventor object.
 * @param {object} imagen - The image object.
 */
function handleAddOrUpdate(action, interventor, imagen) {
  const $buttonContainer = $("<div>");
  const $cameraButton = $("<button>").addClass("customBtn").text("Cámara");
  const $galleryButton = $("<button>").addClass("customBtn").text("Galería");

  $buttonContainer.append($cameraButton, $galleryButton);

  if (action === "update") {
    const $cancelButton = $("<button>")
      .addClass("customBtn")
      .text("Cancelar")
      .click(showModalImagenes);
    $buttonContainer.append($cancelButton);
  }

  $("#ModalImagenesContent").empty().append($buttonContainer);

  // Camera button handler
  $cameraButton.on("click", () => {
    captureImageFromCamera(interventor, imagen);
  });

  // Gallery button handler
  $galleryButton.on("click", () => {
    selectImageFromGallery(interventor, imagen);
  });
}

/**
 * Captures an image using the device camera.
 * @param {object} interventor - The interventor object.
 * @param {object} imagen - The image object.
 */
async function captureImageFromCamera(interventor, imagen) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    const $video = $("<video>").prop("autoplay", true).css({
      "max-width": "80%",
      "max-height": "60vh",
      overflow: "auto",
    });

    const $captureButton = $("<button>")
      .addClass("customBtn")
      .text("Tomar foto");
    $video[0].srcObject = stream;

    $("#ModalImagenesContent").empty().append($video, $captureButton);

    $captureButton.on("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = $video[0].videoWidth;
      canvas.height = $video[0].videoHeight;
      canvas.getContext("2d").drawImage($video[0], 0, 0);
      stream.getTracks().forEach(track => track.stop());

      // Resize and compress the image
      resizeAndCompressImage(canvas.toDataURL("image/jpeg")).then(
        compressedImage => storeImage(interventor, imagen, compressedImage)
      );
    });
  } catch (err) {
    console.error("Error accediendo a la cámara:", err);
    displayAlert(
      "No se pudo acceder a la cámara. Por favor, use la opción de galería.",
      "warning"
    );
  }
}

/**
 * Allows the user to select an image from the device gallery.
 * @param {object} interventor - The interventor object.
 * @param {object} imagen - The image object.
 */
function selectImageFromGallery(interventor, imagen) {
  const $fileInput = $("<input>")
    .attr({
      type: "file",
      accept: "image/*",
    })
    .css("display", "none");

  $fileInput.on("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // Resize and compress the image
        resizeAndCompressImage(e.target.result).then(compressedImage =>
          storeImage(interventor, imagen, compressedImage)
        );
        $fileInput.remove();
      };
      reader.onerror = function (e) {
        console.error("Error leyendo el archivo:", e);
        $fileInput.remove();
      };
      reader.readAsDataURL(file);
    } else {
      $fileInput.remove();
    }
  });

  $("body").append($fileInput);
  $fileInput.trigger("click");
}

/**
 * Resizes and compresses an image to 1024x1024 max dimensions.
 * @param {string} dataUrl - The original image as a data URL.
 * @returns {Promise<string>} A promise that resolves with the compressed image data URL.
 */
function resizeAndCompressImage(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      const maxSize = 1024;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      // Create canvas for resizing
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Apply smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG with 0.8 quality
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressedDataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Stores the image data and updates the modal.
 * @param {object} interventor - The interventor object.
 * @param {object} imagen - The image object.
 * @param {string} base64Image - The base64-encoded image data.
 */
async function storeImage(interventor, imagen, base64Image) {
  imagen.GestionImagen = base64Image
    .replace("data:image/jpeg;base64,", "")
    .replace("data:image/png;base64,", "")
    .replace("data:image/jpg;base64,", "");

  try {
    const res = await guardarImagen(imagen);
    console.log(`Imagen guardada: ${res}`);
  } catch (error) {
    console.log(`Error guardando la imagen: ${error}`);
    displayAlert(
      "No se pudo guardar la imagen. Por favor, intente nuevamente.",
      "warning"
    );
  }

  showModalImagenes();
}

/**
 * Displays the image in a modal.
 * @param {object} imagen - The image object.
 */
function viewImage(imagen) {
  const $imageContainer = $("<div>").css({
    "max-width": "100%",
    "max-height": "80dvh",
    overflow: "auto",
    "scrollbar-width": "none",
    "-ms-overflow-style": "none",
  });
  const $image = $("<img>")
    .attr("src", `data:image/jpeg;base64,${imagen.GestionImagen}`)
    .css("max-width", "100%");
  const $closeButton = $("<button>")
    .addClass("customBtn")
    .text("Cerrar")
    .click(showModalImagenes);

  $imageContainer.append($image);
  $("#ModalImagenesContent").empty().append($imageContainer, $closeButton);
}

/**
 * Confirms deletion of the image and performs the deletion if confirmed.
 * @param {object} imagen - The image object.
 */
function confirmDeleteImage(imagen) {
  const $confirmDialog = $("<div>").text(
    "¿Está seguro que desea eliminar esta imagen?"
  );
  const $confirmButton = $("<button>")
    .addClass("customBtn")
    .text("Confirmar")
    .click(async () => {
      try {
        imagen.GestionImagen = "";
        const res = await guardarImagen(imagen);
        console.log(`Imagen eliminada: ${res}`);
        showModalImagenes();
      } catch (error) {
        console.log(`Error eliminando la imagen: ${error}`);
        displayAlert(
          "No se pudo eliminar la imagen. Por favor, intente nuevamente.",
          "warning"
        );
      }
    });
  const $cancelButton = $("<button>")
    .addClass("customBtn")
    .text("Cancelar")
    .click(showModalImagenes);

  $("#ModalImagenesContent")
    .empty()
    .append($confirmDialog, $confirmButton, $cancelButton);
}

// Export the iniciarFirma function
export { iniciarFirma };
