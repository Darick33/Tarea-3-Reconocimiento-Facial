function init() {
  $("#form_usuarios").on("submit", (e) => {
    GuardarEditar(e);
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
    faceapi.nets.tinyFaceDetector.loadFromUri('../../models/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../../models/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../../models/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../../models/models')
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
  var html = "";
  $.get(
    "../../controllers/usuario.controllers.php?op=todos",
    (ListUsuarios) => {
      ListUsuarios = JSON.parse(ListUsuarios);
      $.each(ListUsuarios, (index, usuario) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td>${usuario.Nombres}</td>
            <td>${usuario.Apellidos}</td>
            <td>${usuario.Rol}</td>
            <td>${usuario.Nombre}</td>
<td>
<button class='btn btn-primary' click='uno(${
          usuario.idUsuarios
        })'>Editar</button>
<button class='btn btn-warning' click='eliminar(${
          usuario.idUsuarios
        })'>Editar</button>
            `;
            lista_imagen.push(usuario.IdImagen)

      });
      $("#ListaUsuarios").html(html);
      console.log(lista_imagen);
    }
  );
};


var GuardarEditar = (e) => {
  e.preventDefault();
  var DatosFormularioUsuario = new FormData($("#form_usuarios")[0]);
  var accion = "../../controllers/usuario.controllers.php?op=insertar";
  DatosFormularioUsuario.append('IdImagen',imagenBase64);
  for (var pair of DatosFormularioUsuario.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }
  

  /**
   * if(SucursalId >0){editar   accion='ruta para editar'}
   * else
   * { accion = ruta para insertar}
   */
  $.ajax({
    url: accion,
    type: "post",
    data: DatosFormularioUsuario,
    processData: false,
    contentType: false,
    cache: false,
    success: (respuesta) => {
      console.log(respuesta);
      respuesta = JSON.parse(respuesta);
      if (respuesta == "ok") {
        alert("Se guardo con éxito");
        CargaLista();
        LimpiarCajas();
      } else {
        alert("no tu pendejada");
      }
    },
  });
};

var uno = () => {};

var sucursales = () => {
  return new Promise((resolve, reject) => {
    var html = `<option value="0">Seleccione una opción</option>`;
    $.post(
      "../../controllers/sucursal.controllers.php?op=todos",
      async (ListaSucursales) => {
        ListaSucursales = JSON.parse(ListaSucursales);
        $.each(ListaSucursales, (index, sucursal) => {
          html += `<option value="${sucursal.SucursalId}">${sucursal.Nombre}</option>`;
        });
        await $("#SucursalId").html(html);
        resolve();
      }
    ).fail((error) => {
      reject(error);
    });
  });
};

var roles = () => {
  return new Promise((resolve, reject) => {
    var html = `<option value="0">Seleccione una opción</option>`;
    $.post(
      "../../controllers/rol.controllers.php?op=todos",
      async (ListaRoles) => {
        ListaRoles = JSON.parse(ListaRoles);
        $.each(ListaRoles, (index, rol) => {
          html += `<option value="${rol.idRoles}">${rol.Rol}</option>`;
        });
        await $("#RolId").html(html);
        resolve();
      }
    ).fail((error) => {
      reject(error);
    });
  });
};

var eliminar = () => {};

var LimpiarCajas = () => {
  (document.getElementById("Nombres").value = ""),
    (document.getElementById("Apellidos").value = ""),
    (document.getElementById("Correo").value = ""),
    (document.getElementById("contrasenia").value = ""),
    $("#ModalUsuarios").modal("hide");
};
init();

