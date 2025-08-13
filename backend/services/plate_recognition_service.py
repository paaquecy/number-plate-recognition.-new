import time
import re
from typing import Tuple, Optional
import os
import base64
import io

# Try to import heavy dependencies optionally
try:
    import cv2  # type: ignore
except Exception:  # ImportError or other errors in headless envs
    cv2 = None  # type: ignore

try:
    import numpy as np  # type: ignore
except Exception:
    np = None  # type: ignore

try:
    from PIL import Image  # type: ignore
except Exception:
    Image = None  # type: ignore

try:
    import easyocr  # type: ignore
except Exception:
    easyocr = None  # type: ignore


class PlateRecognitionService:
    def __init__(self):
        # Initialize EasyOCR for text recognition if available and enabled
        self.reader = None
        enable_ocr = os.getenv('ENABLE_OCR', 'false').lower() in ('1', 'true', 'yes', 'on')
        if enable_ocr and easyocr is not None:
            try:
                self.reader = easyocr.Reader(['en'])
            except Exception:
                self.reader = None

        # Ghana license plate patterns
        self.plate_patterns = [
            r'^[A-Z]{2,3}\s?\d{3,4}\s?[A-Z]{1,2}$',  # Standard format: AB 1234 C
            r'^[A-Z]{2,3}\d{3,4}[A-Z]{1,2}$',         # No spaces: AB1234C
            r'^[A-Z]{2,3}\s\d{3,4}\s[A-Z]{1,2}$',     # With spaces: AB 1234 C
            r'^[A-Z]{2,3}\d{3,4}$',                    # Short format: AB1234
            r'^[A-Z]{2,3}\s\d{3,4}$',                  # Short with space: AB 1234
        ]

        # Load pre-trained model for plate detection (if available)
        self.plate_cascade = None
        # Optional: keep placeholder; no-op when unavailable

    def preprocess_image(self, image):
        """Preprocess image for better plate detection"""
        if cv2 is None:
            return image
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        # Apply morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        return morph

    def detect_plate_regions(self, image):
        """Detect potential license plate regions in the image"""
        if cv2 is None:
            return []
        plate_regions = []
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Minimum area threshold
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                if 2.5 <= aspect_ratio <= 5.5:
                    plate_regions.append((x, y, w, h))
        return plate_regions

    def extract_text_from_region(self, image, region: Tuple[int, int, int, int]) -> str:
        """Extract text from a specific region using OCR"""
        if cv2 is None or self.reader is None:
            return ""
        x, y, w, h = region
        roi = image[y:y+h, x:x+w]
        processed_roi = self.preprocess_image(roi)
        results = self.reader.readtext(processed_roi) if self.reader else []
        text = ' '.join([result[1] for result in results]) if results else ''
        return text.strip()

    def clean_plate_text(self, text: str) -> str:
        """Clean and validate license plate text"""
        cleaned = re.sub(r'[^A-Z0-9\s]', '', text.upper())
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    def validate_plate_format(self, text: str) -> bool:
        """Validate if the extracted text matches Ghana license plate format"""
        for pattern in self.plate_patterns:
            if re.match(pattern, text):
                return True
        return False

    def recognize_plate(self, image_data: str) -> Tuple[str, float, float]:
        """
        Recognize license plate from base64 encoded image

        Returns:
            Tuple of (plate_number, confidence, processing_time)
        """
        start_time = time.time()

        # If required heavy libs are unavailable, return a safe fallback
        if cv2 is None or Image is None or np is None or self.reader is None:
            processing_time = time.time() - start_time
            return "UNKNOWN", 0.0, processing_time

        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)

            # Convert RGB to BGR for OpenCV
            if len(image_np.shape) == 3:
                image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

            # Detect plate regions
            plate_regions = self.detect_plate_regions(image_np)

            best_plate = None
            best_confidence = 0.0

            # Process each detected region
            for region in plate_regions:
                text = self.extract_text_from_region(image_np, region)
                cleaned_text = self.clean_plate_text(text)
                if cleaned_text and self.validate_plate_format(cleaned_text):
                    confidence = min(len(cleaned_text) / 10.0, 1.0)
                    if confidence > best_confidence:
                        best_plate = cleaned_text
                        best_confidence = confidence

            # If no valid plate found, try OCR on the entire image
            if not best_plate:
                processed_image = self.preprocess_image(image_np)
                results = self.reader.readtext(processed_image) if self.reader else []
                for result in results:
                    text = result[1]
                    cleaned_text = self.clean_plate_text(text)
                    if cleaned_text and self.validate_plate_format(cleaned_text):
                        confidence = min(len(cleaned_text) / 10.0, 1.0)
                        if confidence > best_confidence:
                            best_plate = cleaned_text
                            best_confidence = confidence

            processing_time = time.time() - start_time
            if best_plate:
                return best_plate, best_confidence, processing_time
            else:
                return "UNKNOWN", 0.0, processing_time

        except Exception as e:
            print(f"Plate recognition error: {e}")
            processing_time = time.time() - start_time
            return "ERROR", 0.0, processing_time

    def enhance_image(self, image):
        """Enhance image for better OCR results"""
        if cv2 is None:
            return image
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        equalized = cv2.equalizeHist(gray)
        filtered = cv2.bilateralFilter(equalized, 9, 75, 75)
        thresh = cv2.adaptiveThreshold(filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        return thresh

    def save_debug_image(self, image, plate_regions: list, filename: str = "debug_plate.jpg"):
        """Save debug image with detected regions marked"""
        if cv2 is None:
            return
        debug_image = image.copy()
        for i, (x, y, w, h) in enumerate(plate_regions):
            cv2.rectangle(debug_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(debug_image, f"Region {i+1}", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        cv2.imwrite(filename, debug_image)
        print(f"Debug image saved as {filename}") 