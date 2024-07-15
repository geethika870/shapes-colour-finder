from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('body-analyzer.html')

@app.route('/analyze_body_shape', methods=['POST'])
def analyze_body_shape():
    image_data = request.json['image_data'].split(',')[1]  # Remove data:image/png;base64
    image = Image.open(BytesIO(base64.b64decode(image_data)))
    image_path = 'uploaded_image.png'
    image.save(image_path)
    
    bust_in, waist_in, hips_in, high_hip_in = process_image_and_transfer(image_path)
    if bust_in is None:
        return jsonify({'error': 'Image processing failed'})
    
    body_shape = classify_body_shape(bust_in, waist_in, hips_in, high_hip_in)
    recommendations = get_recommendations(body_shape)
    
    return jsonify({'body_shape': body_shape, 'recommendations': recommendations})

def process_image_and_transfer(image_path):
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not open or find the image at {image_path}")
        return None, None, None, None

    # Implement your logic here to detect and measure body dimensions accurately from the image
    # Placeholder measurements (in inches)
    bust_in = 36.0   # Bust measurement in inches
    waist_in = 28.0  # Waist measurement in inches
    hips_in = 38.0   # Hips measurement in inches
    high_hip_in = 35.0  # High hip measurement in inches (optional)

    return bust_in, waist_in, hips_in, high_hip_in

def classify_body_shape(bust_in, waist_in, hips_in, high_hip_in=None):
    if high_hip_in is None:
        high_hip_in = hips_in

    # Convert inches to centimeters for comparison if needed
    bust_cm = bust_in * 2.54
    waist_cm = waist_in * 2.54
    hips_cm = hips_in * 2.54
    high_hip_cm = high_hip_in * 2.54
    
    # Hourglass
    if (bust_in - hips_in <= 1 and hips_in - bust_in < 3.6 and (bust_in - waist_in >= 9 or hips_in - waist_in >= 10)):
        return "Hourglass"
    
    # Bottom hourglass
    elif (hips_in - bust_in >= 3.6 and hips_in - bust_in < 10 and hips_in - waist_in >= 9 and (high_hip_in / waist_in) < 1.193):
        return "Bottom hourglass"
    
    # Top hourglass
    elif (bust_in - hips_in > 1 and bust_in - hips_in < 10 and bust_in - waist_in >= 9):
        return "Top hourglass"
    
    # Spoon
    elif (hips_in - bust_in > 2 and hips_in - waist_in >= 7 and (high_hip_in / waist_in) >= 1.193):
        return "Spoon"
    
    # Triangle
    elif (hips_in - bust_in >= 3.6 and hips_in - waist_in < 9):
        return "Triangle"
    
    # Inverted triangle
    elif (bust_in - hips_in >= 3.6 and bust_in - waist_in < 9):
        return "Inverted triangle"
    
    # Rectangle
    elif (hips_in - bust_in < 3.6 and bust_in - hips_in < 3.6 and bust_in - waist_in < 9 and hips_in - waist_in < 10):
        return "Rectangle"
    
    return "Unknown"

def get_recommendations(body_shape):
    recommendations = {
        "Hourglass": "Fitted dresses, pencil skirts",
        "Bottom hourglass": "High-waisted skirts, peplum tops",
        "Top hourglass": "Tailored blazers, structured tops",
        "Spoon": "Bootcut jeans, flowy tops",
        "Triangle": "Flared pants, A-line skirts",
        "Inverted triangle": "Off-shoulder tops, wide-legged pants",
        "Rectangle": "Belted dresses, peplum tops",
        "Unknown": "Outfits: Not available"
    }
    return recommendations.get(body_shape, "Outfits: Not available")

if __name__ == '__main__':
    app.run(debug=True)
