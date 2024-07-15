function openFileChooser() {
  document.getElementById('imageUpload').click();
}

function openCamera() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');

  navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
          video.style.display = 'block';
          video.srcObject = stream;
      })
      .catch((err) => {
          console.error('Error accessing camera: ', err);
      });

  video.addEventListener('play', () => {
      const context = canvas.getContext('2d');
      const interval = setInterval(() => {
          if (video.paused || video.ended) {
              clearInterval(interval);
              return;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }, 100);
  });
}

function analyzeBodyShape() {
  const fileInput = document.getElementById('imageUpload');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const resultDiv = document.getElementById('result');
  const context = canvas.getContext('2d');

  if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              context.drawImage(img, 0, 0, canvas.width, canvas.height);
              analyzeImage(canvas, resultDiv);
          };
          img.src = e.target.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
  } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      analyzeImage(canvas, resultDiv);
  }
}

function analyzeImage(canvas, resultDiv) {
  const imageData = canvas.toDataURL('image/png');
  
  // Mock logic for body shape analysis (replace with actual image processing logic)
  const bodyShape = classifyBodyShape();

  // Update the result div with the analyzed body shape and recommendations
  const recommendations = getRecommendations(bodyShape);
  resultDiv.innerHTML = `<p>Body Shape: ${bodyShape}</p><p>Recommendations: ${recommendations}</p>`;
}

function classifyBodyShape() {
  // Mock classification logic (replace with actual logic)
  // This is a placeholder and should be replaced with actual analysis logic
  return 'Hourglass';
}

function getRecommendations(bodyShape) {
  switch (bodyShape) {
      case 'Hourglass':
          return 'Fitted dresses, pencil skirts';
      case 'Bottom hourglass':
          return 'High-waisted skirts, peplum tops';
      case 'Top hourglass':
          return 'Tailored blazers, structured tops';
      case 'Spoon':
          return 'Bootcut jeans, flowy tops';
      case 'Triangle':
          return 'Flared pants, A-line skirts';
      case 'Inverted triangle':
          return 'Off-shoulder tops, wide-legged pants';
      case 'Rectangle':
          return 'Belted dresses, peplum tops';
      default:
          return 'Outfits: Not available';
  }
}
