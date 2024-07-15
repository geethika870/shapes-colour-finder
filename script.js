function openFileChooser() {
    document.getElementById('imageUpload').click();
}

function openCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    video.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            video.addEventListener('click', () => {
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL();
                detectSkinTone(dataURL);
                video.style.display = 'none';
                stream.getTracks().forEach(track => track.stop());
            });
        })
        .catch(error => console.error(error));
}

function detectSkinTone(imageSrc = null) {
    const imageUpload = document.getElementById('imageUpload');
    const resultDiv = document.getElementById('result');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const pixels = extractSkinPixels(imageData.data);
        const dominantColor = getDominantColor(pixels);
        const skinToneCategory = mapSkinTone(dominantColor);
        const recommendedColors = getRecommendedColors(skinToneCategory);
        displayResult(skinToneCategory, recommendedColors);
    };

    if (imageSrc) {
        img.src = imageSrc;
    } else if (imageUpload.files && imageUpload.files[0]) {
        const reader = new FileReader();
        reader.onload = e => img.src = e.target.result;
        reader.readAsDataURL(imageUpload.files[0]);
    }
}

function extractSkinPixels(data) {
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (isSkinColor(r, g, b)) {
            pixels.push([r, g, b]);
        }
    }
    return pixels;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15;
}

function getDominantColor(pixels) {
    const colorMap = {};
    let dominantColor = pixels[0];
    let maxCount = 0;
    
    pixels.forEach(color => {
        const key = color.join(',');
        colorMap[key] = (colorMap[key] || 0) + 1;
        
        if (colorMap[key] > maxCount) {
            maxCount = colorMap[key];
            dominantColor = color;
        }
    });
    
    return dominantColor;
}

function mapSkinTone(dominantColor) {
    if (dominantColor[0] < 50) return "Deep Winter";
    if (dominantColor[0] < 100) return "Cool Winter";
    if (dominantColor[0] < 150) return "Clear Winter";
    if (dominantColor[0] < 200) return "Warm Spring";
    return "Light Spring";
}

const colorRecommendations = {
    "Warm Spring": [("Persimmon", "#FF5733"), ("Golden Yellow", "#FFC300"), ("Light Mint Green", "#DAF7A6")],
    "Light Spring": [("Light Pink", "#FFB6C1"), ("Lemon Chiffon", "#FFFACD"), ("Light Goldenrod", "#FAFAD2")],
    "Clear Spring": [("Gold", "#FFD700"), ("Light Salmon", "#FFA07A"), ("Orange Red", "#FF4500")],
    "Soft Autumn": [("Saddle Brown", "#8B4513"), ("Chocolate", "#D2691E"), ("Sandy Brown", "#F4A460")],
    "Deep Autumn": [("Maroon", "#800000"), ("Dark Red", "#8B0000"), ("Brown", "#A52A2A")],
    "Warm Autumn": [("Tomato", "#FF6347"), ("Coral", "#FF7F50"), ("Orange Red", "#FF4500")],
    "Deep Winter": [("Dark Purple", "#581845"), ("Crimson", "#900C3F"), ("Red", "#C70039")],
    "Clear Winter": [("Blue", "#0000FF"), ("Royal Blue", "#4169E1"), ("Steel Blue", "#4682B4")],
    "Cool Winter": [("Dodger Blue", "#1E90FF"), ("Dark Turquoise", "#00CED1"), ("Cadet Blue", "#5F9EA0")],
    "Cool Summer": [("Pale Turquoise", "#AFEEEE"), ("Powder Blue", "#B0E0E6"), ("Light Blue", "#ADD8E6")],
    "Soft Summer": [("Steel Blue", "#4682B4"), ("Light Steel Blue", "#B0C4DE"), ("Cadet Blue", "#5F9EA0")],
    "Light Summer": [("Light Cyan", "#E0FFFF"), ("Khaki", "#F0E68C"), ("Lemon Chiffon", "#FFFACD")]
};

function getRecommendedColors(skinToneCategory) {
    return colorRecommendations[skinToneCategory] || [];
}

function displayResult(skinToneCategory, recommendedColors) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h3>Skin Tone: ${skinToneCategory}</h3>`;
    recommendedColors.forEach(([colorName, colorHex]) => {
        resultDiv.innerHTML += `
            <div class="color-swatch" style="background-color: ${colorHex};">
                <span>${colorName}</span>
                <span>${colorHex}</span>
            </div>
        `;
    });
}
