function init() {
  $("#frm").on("submit", (e) => {
    RegistroAsistencia(e);
  });
}
let imagenBase64;

function startVideo() {
  const video = document.getElementById("video");

  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((mediaStream) => {
      video.srcObject = mediaStream;
    })
    .catch((error) => {
      alert("Error al acceder a la cámara web");
    });
}
startVideo();

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models/models'),
    faceapi.nets.ageGenderNet.loadFromUri('./models/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models/models')
  ]).then(() => {
    startVideo();
 
  }).catch((error) => {
    console.error("Error al cargar los modelos de face-api:", error);
  });
});




video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  // $("#video_p").append(canvas);
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    const context = canvas.getContext('2d')
    context.drawImage(video,0,0,canvas.width,canvas.height);




    imagenBase64 = canvas.toDataURL("image/jpeg");
    // console.log(imagenBase64);
    
    compararRostros();
   

  // Extraer descripciones de rostros
  const faceDescriptors1 = detections.map(detection => detection.descriptor);
 

    console.log(faceDescriptors1);


   

   

    // Imprimir las coordenadas x e y de cada landmark detectado
    resizeDetections.forEach(detection => {
      const landmarks = detection.landmarks;
      Object.keys(landmarks).forEach(part => {
        for(let i = 0; i < landmarks[part].length; i++) {
          const landmark = landmarks[part][i];
          // console.log(`Landmark ${part} ${i}: X=${landmark.x}, Y=${landmark.y}`);
          // Puedes imprimirlo en algún otro lugar de la interfaz si lo deseas
        }
      });
    });
  }, 100);

 
});

let lista_imagen = [];

$().ready(() => {
  CargaLista();
  // CargaLista_imagen();
});
var CargaLista = () => {
  
  $.get(
    "./controllers/usuario.controllers.php?op=todos",
    (ListUsuarios) => {
      ListUsuarios = JSON.parse(ListUsuarios);
      $.each(ListUsuarios, (index, usuario) => {
            let imagen = {
              Cedula: usuario.Cedula,
              IdImagen: usuario.IdImagen
            };
            lista_imagen.push(imagen);

      });
      // $("#ListaUsuarios").html(html);
      console.log(lista_imagen);
    }
  );
};

// Función para iniciar la autenticación facial
// Función para iniciar la autenticación facial
// Función para iniciar la autenticación facial











// async function compararRostros() {
//   if (!faceapi.nets.tinyFaceDetector.params) {
//     // Modelos no cargados, espera o maneja el error de alguna manera
//     return;
//   }
  
//   const primerElemento = lista_imagen[0].IdImagen;
//   // console.log(primerElemento);
//   // Convertir las imágenes base64 en tensores
//   const tensor1 = await faceapi.fetchImage(imagenBase64);
//   const tensor2 = await faceapi.fetchImage(primerElemento);

//   // Detectar los rostros en ambas imágenes
//   const detection1 = await faceapi.detectSingleFace(tensor1).withFaceLandmarks().withFaceDescriptor();
//   const detection2 = await faceapi.detectSingleFace(tensor2).withFaceLandmarks().withFaceDescriptor();

//   if (!detection1 || !detection2) {
//     return "No se pudieron detectar los rostros en una o ambas imágenes.";
//   }

//   // Crear faceMatcher con el descriptor del rostro almacenado
//   const faceMatcher = new faceapi.FaceMatcher([detection1.descriptor]);

//   // Encontrar el mejor match en la nueva imagen
//   const mejorMatch = faceMatcher.findBestMatch(detection2.descriptor);

//   // Retornar el mensaje indicando si los rostros son iguales o no
//   console.log(mejorMatch);
//   if (mejorMatch._label === "unknown") {
//     console.log("Los rostros son diferentes.")
//   } else {
//     console.log("Los rostros son iguales.")
//   }
// }




async function compararRostros() {
  if (!faceapi.nets.tinyFaceDetector.params) {
    // Modelos no cargados, espera o maneja el error de alguna manera
    return;
  }
  
  // Convertir la imagen base64 en tensor
  const tensor1 = await faceapi.fetchImage(imagenBase64);

  // Iterar sobre cada elemento del array lista_imagen
  lista_imagen.forEach(async (elemento, indice) => {
    const tensor2 = await faceapi.fetchImage(elemento.IdImagen);

    // Detectar los rostros en ambas imágenes
    const detection1 = await faceapi.detectSingleFace(tensor1).withFaceLandmarks().withFaceDescriptor();
    const detection2 = await faceapi.detectSingleFace(tensor2).withFaceLandmarks().withFaceDescriptor();

    if (!detection1 || !detection2) {
      console.log(`No se pudieron detectar los rostros en la imagen ${indice}.`);
      return;
    }

    // Crear faceMatcher con el descriptor del rostro almacenado
    const faceMatcher = new faceapi.FaceMatcher([detection1.descriptor]);

    // Encontrar el mejor match en la nueva imagen
    const mejorMatch = faceMatcher.findBestMatch(detection2.descriptor);

    // Retornar el mensaje indicando si los rostros son iguales o no
    console.log(`Comparación del elemento ${indice}:`);
    if (mejorMatch._label === "unknown") {
      console.log("Los rostros son diferentes.")
    } else {
      console.log("Los rostros son iguales.")
    }
  });
}























$().ready(() => {
  tiposacceso();
});

var RegistroAsistencia = (e) => {
  e.preventDefault();
  var formulario = new FormData($("#frm")[0]);
  alert("aqui");
  $.ajax({
    url: "controllers/usuario.controllers.php?op=unoconCedula",
    type: "post",
    data: formulario,
    processData: false,
    contentType: false,
    cache: false,
    success: (respuesta) => {
      console.log(respuesta);
    },
  }).done((usuarioId) => {
    usuarioId = JSON.parse(usuarioId);
    formulario.append("usuariosId", usuarioId.idUsuarios);
    $.ajax({
      url: "controllers/accesos.controllers.php?op=insertar",
      type: "post",
      data: formulario,
      processData: false,
      contentType: false,
      cache: false,
      success: (respuesta) => {
        console.log(respuesta);
        respuesta = JSON.parse(respuesta);
        if (respuesta == "ok") {
          //Swal.fire(Titulo, texto, tipo de alerta)
          Swal.fire("Registro de Asistencia", "Se guardo con éxito", "success");
        } else {
          Swal.fire(
            "Registro de Asistencia",
            "Hubo un error al guardar",
            "danger"
          );
        }
      },
    });
  });
};

var tiposacceso = () => {
  return new Promise((resolve, reject) => {
    var html = `<option value="0">Seleccione una opción</option>`;
    $.post("controllers/tipoacceso.controllers.php?op=todos", async (lista) => {
      lista = JSON.parse(lista);
      $.each(lista, (index, tipo) => {
        html += `<option value="${tipo.IdTipoAcceso}">${tipo.Detalle}</option>`;
      });
      await $("#tipo").html(html);
      resolve();
    }).fail((error) => {
      reject(error);
    });
  });
};
init();


