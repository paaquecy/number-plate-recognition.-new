import base64
import io
import time
import re
from typing import Tuple, Optional, Any
import os

# Try to import heavy dependencies; allow running without them
OCR_AVAILABLE = True
cv2 = None
np = None
Image = None
try:
    import cv2  # type: ignore
    import numpy as np  # type: ignore
    from PIL import Image  # type: ignore
    import easyocr  # type: ignore
except Exception:
    OCR_AVAILABLE = False


class PlateRecognitionService:
    def __init__(self):
        self.ocr_disabled = os.getenv("DISABLE_OCR", "false").lower() in {"1", "true", "yes"}
        self.reader = None

        if self.ocr_disabled:
            print("PlateRecognitionService: OCR disabled via DISABLE_OCR env var")
            return

        if not OCR_AVAILABLE:
            print("PlateRecognitionService: OCR dependencies not available; running in disabled mode")
            return

        # Initialize EasyOCR for text recognition
        self.reader = easyocr.Reader(['en'])

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
        try:
            # You can download a pre-trained cascade classifier for license plate detection
            # self.plate_cascade = cv2.CascadeClassifier('models/haarcascade_russian_plate_number.xml')
            pass
        except:
            print("Plate cascade classifier not found, using contour detection")

    def _require_ocr(self):
        if self.ocr_disabled or not OCR_AVAILABLE or self.reader is None:
            raise RuntimeError("OCR is disabled or dependencies are missing")

    def preprocess_image(self, image: Any) -> Any:
        self._require_ocr()
        """Preprocess image for better plate detection"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,
            2,
        )

        # Apply morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        return morph

    def detect_plate_regions(self, image: Any) -> list:
        self._require_ocr()
        """Detect potential license plate regions in the image"""
        plate_regions = []

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)

        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter contours based on area and aspect ratio
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Minimum area threshold
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h

                # License plates typically have aspect ratios between 2.5 and 5.5
                if 2.5 <= aspect_ratio <= 5.5:
                    plate_regions.append((x, y, w, h))

        return plate_regions

    def extract_text_from_region(self, image: Any, region: Tuple[int, int, int, int]) -> str:
        self._require_ocr()
        """Extract text from a specific region using OCR"""
        x, y, w, h = region
        roi = image[y:y+h, x:x+w]

        # Preprocess the region
        processed_roi = self.preprocess_image(roi)

        # Use EasyOCR to extract text
        result = self.reader.readtext(np.array(Image.fromarray(cv2.cvtColor(roi, cv2.COLOR_BGR2RGB))))

        # Combine all detected text
        text = " ".join([text for _, text, _ in result])

        return text.strip()

    def clean_plate_text(self, text: str) -> str:
        """Clean and validate license plate text"""
        # Remove extra spaces and special characters
        cleaned = re.sub(r'[^A-Z0-9\s]', '', text.upper())
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        return cleaned

    def validate_plate_format(self, text: str) -> bool:
        """Validate if the extracted text matches Ghana license plate format"""
        for pattern in self.plate_patterns:
            if re.match(pattern, text):
                return True
        return False

    def validate_plate_number(self, text: str) -> Optional[str]:
        candidates = text.upper().split()
        for candidate in candidates:
            for pattern in self.plate_patterns:
                if re.match(pattern, candidate):
                    return candidate
        return None

    async def recognize_plate(self, image_data_base64: str) -> Tuple[str, float, float]:
        self._require_ocr()
        """
        Recognize license plate from base64 encoded image

        Returns:
            Tuple of (plate_number, confidence, processing_time)
        """
        start_time = time.time()

        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data_base64)
            image = Image.open(io.BytesIO(image_bytes))
            image_np = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # Detect plate regions
            plate_regions = self.detect_plate_regions(image_np)

            best_plate = ""
            best_confidence = 0.0

            # Process each detected region
            for region in plate_regions:
                text = self.extract_text_from_region(image_np, region)
                cleaned_text = self.clean_plate_text(text)

                if cleaned_text and self.validate_plate_format(cleaned_text):
                    # Calculate confidence based on text length and format
                    confidence = min(len(cleaned_text) / 10.0, 1.0)

                    if confidence > best_confidence:
                        best_plate = cleaned_text
                        best_confidence = confidence

            # If no valid plate found, try OCR on the entire image
            if not best_plate:
                # Process entire image
                processed_image = self.preprocess_image(image_np)
                results = self.reader.readtext(processed_image)

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

    def enhance_image(self, image: Any) -> Any:
        """Enhance image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply histogram equalization
        equalized = cv2.equalizeHist(gray)

        # Apply bilateral filter to reduce noise while preserving edges
        filtered = cv2.bilateralFilter(equalized, 9, 75, 75)

        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        return thresh

    def save_debug_image(self, image: Any, plate_regions: list, filename: str = "debug_plate.jpg"):
        """Save debug image with detected regions marked"""
        debug_image = image.copy()

        for i, (x, y, w, h) in enumerate(plate_regions):
            cv2.rectangle(debug_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(debug_image, f"Region {i+1}", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        cv2.imwrite(filename, debug_image)
        print(f"Debug image saved as {filename}") 