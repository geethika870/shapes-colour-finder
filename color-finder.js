function openFileChooser() {
    document.getElementById('imageUpload').click();
}

function openCamera() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.style.display = 'block';
            setTimeout(() => {
                captureImage();
                stream.getTracks().forEach(track => track.stop());
                video.style.display = 'none';
            }, 3000);  // Capture after 3 seconds
        })
        .catch(err => console.error("Error accessing camera: ", err));
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    detectSkinTone(dataUrl);
}

function detectSkinTone(imageUrl = null) {
    let image = new Image();
    if (imageUrl) {
        image.src = imageUrl;
    } else {
        image.src = URL.createObjectURL(document.getElementById('imageUpload').files[0]);
    }
    image.onload = () => {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        const dominantColor = [r, g, b];
        const skinToneCategory = mapSkinTone(dominantColor);
        displayResults(skinToneCategory);
    };
}

function mapSkinTone(dominantColor) {
    if (dominantColor[0] < 50) {
        return "Deep Winter";
    } else if (dominantColor[0] < 100) {
        return "Cool Winter";
    } else if (dominantColor[0] < 150) {
        return "Clear Winter";
    } else if (dominantColor[0] < 200) {
        return "Warm Spring";
    } else {
        return "Light Spring";
    }
}

function displayResults(skinToneCategory) {
    const colorRecommendations = {
        "Warm Spring": [["Persimmon", "#FF5733"], ["Golden Yellow", "#FFC300"], ["Light Mint Green", "#DAF7A6"]],
        "Light Spring": [["Light Pink", "#FFB6C1"], ["Lemon Chiffon", "#FFFACD"], ["Light Goldenrod", "#FAFAD2"]],
        "Clear Spring": [["Gold", "#FFD700"], ["Light Salmon", "#FFA07A"], ["Orange Red", "#FF4500"]],
        "Soft Autumn": [["Saddle Brown", "#8B4513"], ["Chocolate", "#D2691E"], ["Sandy Brown", "#F4A460"]],
        "Deep Autumn": [["Maroon", "#800000"], ["Dark Red", "#8B0000"], ["Brown", "#A52A2A"]],
        "Warm Autumn": [["Tomato", "#FF6347"], ["Coral", "#FF7F50"], ["Orange Red", "#FF4500"]],
        "Deep Winter": [["Dark Purple", "#581845"], ["Crimson", "#900C3F"], ["Red", "#C70039"]],
        "Clear Winter": [["Blue", "#0000FF"], ["Royal Blue", "#4169E1"], ["Steel Blue", "#4682B4"]],
        "Cool Winter": [["Dodger Blue", "#1E90FF"], ["Dark Turquoise", "#00CED1"], ["Cadet Blue", "#5F9EA0"]],
        "Cool Summer": [["Pale Turquoise", "#AFEEEE"], ["Powder Blue", "#B0E0E6"], ["Light Blue", "#ADD8E6"]],
        "Soft Summer": [["Steel Blue", "#4682B4"], ["Light Steel Blue", "#B0C4DE"], ["Cadet Blue", "#5F9EA0"]],
        "Light Summer": [["Light Cyan", "#E0FFFF"], ["Khaki", "#F0E68C"], ["Lemon Chiffon", "#FFFACD"]]
    };

    const recommendedColors = colorRecommendations[skinToneCategory] || [];
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Skin Tone: ${skinToneCategory}</h3>
                           <div>Recommended Colors:</div>`;
    
    recommendedColors.forEach(([colorName, colorHex]) => {
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        colorSwatch.style.backgroundColor = colorHex;

        const colorNameElement = document.createElement('span');
        colorNameElement.textContent = colorName;
        
        colorSwatch.appendChild(colorNameElement);
        resultDiv.appendChild(colorSwatch);
    });
}
