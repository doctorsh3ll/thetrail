document.addEventListener("DOMContentLoaded", function() {
    const footerBtn = document.querySelector('.footer-start-btn');
    const btn = document.getElementById('footer-start-btn');
    const footer = document.getElementById('footer');
    const distance = document.getElementById('footer-distance-btn');
    const cronometroDisplay = document.getElementById('cronometro');
    const footerEnd = document.getElementById('footer-end-btn')
    const clsBtn = document.getElementById('c-close-btn')
    const prontoBtnFoda = document.querySelector('.footer-start-pronto')
    const chooseContainer = document.getElementById('footer-container')
    const btnsContainer = document.getElementById('footer-btns')

    let running = false;
    let paused = false;
    let startTime;
    let elapsedTime = 0;
    let interval;

    function startCronometro() {
        startTime = Date.now() - elapsedTime;
        interval = setInterval(updateCronometro, 1000);
        running = true;
        paused = false;
        footerBtn.innerHTML = '<img id="footer-start-img-pause" src="svg/pause-svg.svg" alt="">Pausar';
    }


    function pauseCronometro() {
        clearInterval(interval);
        paused = true;
        footerBtn.textContent = 'Retomar';
    }

    function resumeCronometro() {
        startCronometro();
    }

    function prontoBtn() {
        var navItems = document.getElementById('footer-start-container')
    
        navItems.style.display = 'flex'
    }

    prontoBtnFoda.addEventListener('click', function() {
        var navItems = document.getElementById('footer-start-container')

            chooseContainer.style.display = 'none';
            footer.style.height = '20vh';
            navItems.style.display = 'flex'

});

    function updateCronometro() {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        const time = new Date(elapsedTime);
        let hours = time.getUTCHours().toString().padStart(2, '0');
        let minutes = time.getUTCMinutes().toString().padStart(1, '0');
        const seconds = time.getUTCSeconds().toString().padStart(2, '0');

        if (hours === '00' && minutes < 10) {
            minutes = '0' + minutes;
        }

        cronometroDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    footerBtn.addEventListener('click', function() {
        if (!running) {
            startCronometro();
            distance.style.display = 'flex';
            footer.style.height = '22vh';
            btn.style.borderRadius = '15px'
            footerEnd.style.display = 'block'
            btn.style.backgroundColor = '#f5f5f5'
            btn.style.color = '#000000'
            btn.style.margin = '0% 2.5%'
            btn.style.padding = '3.5% 3.5%'
            footerEnd.style.margin = '0% 2.5%'
        } else if (paused) {
            resumeCronometro();
        } else {
            pauseCronometro();
        }
    });
    footerEnd.addEventListener('click', function() {
        pauseCronometro(); // Termina a trilha, mas apenas pausa o cronômetro
        tempoTrilhaTerminada = cronometroDisplay.textContent;
    });
});

function goBack() {
  window.history.back();
}

function sumirPopup() {
  var popup = document.getElementById('pop-up');
  var Spopup = document.getElementById('s-pop-up');

  document.getElementById("mymeta").setAttribute("content", "#f8f8f8");

  popup.classList.add("sumindo");
  Spopup.classList.add("sumindo");
}

function aparecerPopup() {
  var popup = document.getElementById('pop-up');
  var Spopup = document.getElementById('s-pop-up');

  document.getElementById("mymeta").setAttribute("content", "#A1A1A1");

  popup.classList.add("aparecendo");
  Spopup.classList.add("aparecendo");
  if ("vibrate" in navigator) {
    // Vibra por 1000ms (1 segundo)
    navigator.vibrate(1000);
  } else {
    console.log("O navegador não suporta a API de vibração.");
  }
}

function clickAccept() {
    var navItems = document.getElementById('footer-start-container')
    var canvas = document.getElementById('resume-canvas')

    document.getElementById("mymeta").setAttribute("content", "#f8f8f8");

    canvas.classList.add("aparecendo")
    navItems.classList.add("sumindo")
    footer.style.height = '100vh';
    footer.style.borderRadius = '0px';
}


function closeFooter() {
    var navItems = document.getElementById('footer-start-container')
    var canvas = document.getElementById('resume-canvas')

    canvas.classList.add("sumindo")
    navItems.classList.add("aparecendo")
    footer.style.height = '20vh';
}

function selectedContainer() {
    var selected = document.getElementById('selected-container')

    selected.style.display = 'flex'
}

function generateImage(imageSrc) {
   const canvas = document.getElementById('canvas');
   const ctx = canvas.getContext('2d');

   // Clear canvas
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   // Get image source
   const image = new Image();
   image.crossOrigin = "Anonymous"; // Definir crossOrigin para permitir CORS
   image.onload = function() {
       // Definir as dimensões da imagem e do canvas
       const imageWidth = image.width;
       const imageHeight = image.height;
       const canvasWidth = canvas.width;
       const canvasHeight = canvas.height;

       // Calcular o fator de escala para ajustar a imagem ao tamanho do canvas
       const scaleX = canvasWidth / imageWidth;
       const scaleY = canvasHeight / imageHeight;
       const scale = Math.max(scaleX, scaleY);
       const newWidth = imageWidth * scale;
       const newHeight = imageHeight * scale;

       // Calcular as coordenadas para centralizar a imagem
       const offsetX = (canvasWidth - newWidth) / 2;
       const offsetY = (canvasHeight - newHeight) / 2;

       // Desenhar a imagem com o efeito de zoom
       ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);

       const gradient = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight - 150);
       gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
       gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
       ctx.fillStyle = gradient;
       ctx.fillRect(0, canvasHeight - 150, canvasWidth, 200);

       // Desenhar o texto em posição absoluta
       ctx.fillStyle = 'white';
       ctx.font = 'bold 30px Manrope'; // Texto em negrito
       ctx.fillText(totalDistance.toFixed(2) + ' km', 20, canvasHeight - 40);
       ctx.fillText(tempoTrilhaTerminada, 250, canvasHeight - 40);
       ctx.fillText(Math.round(totalElevationGain) + ' m', 420, canvasHeight - 40);

       ctx.font = '15px Manrope'; // Texto normal
       ctx.fillText("Distância", 20, canvasHeight - 20);
       ctx.fillText("Duração", 250, canvasHeight - 20);
       ctx.fillText("Ganho de elev.", 440, canvasHeight - 20);
   };

   // If no image source provided, use a placeholder
   if (!imageSrc) {
       image.src = 'foda.jpg'; // Substitua 'placeholder.jpg' pelo caminho da sua imagem local
   } else {
       image.src = imageSrc;
   }
}

// Call generateImage when page loads
window.onload = function() {
   generateImage();
};

// Call generateImage when user selects a file
document.getElementById('imageInput').onchange = function(event) {
   const file = event.target.files[0];
   const reader = new FileReader();
   reader.onload = function(event) {
       generateImage(event.target.result);
   };
   reader.readAsDataURL(file);
};

// Função para compartilhar imagem
function shareImage() {
   const canvas = document.getElementById('canvas');

   // Convert canvas to a blob
   canvas.toBlob(function(blob) {
       // Create a file from the blob
       const file = new File([blob], 'image.png', { type: 'image/png' });

       // Check if Web Share API is supported
       if (navigator.share) {
           // Share the file
           navigator.share({
               files: [file],
               title: 'Generated Image',
               text: 'Check out this generated image!'
           }).then(() => console.log('Shared successfully.'))
           .catch((error) => console.error('Error sharing:', error));
       } else {
           alert('Web Share API is not supported on this browser.');
       }
   }, 'image/png');
}