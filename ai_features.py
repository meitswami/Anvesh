"""
AI Features Module for Anvesh
Includes OCR, Object Detection, Face Detection, and Face Matching
"""
import os
import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
import base64
from PIL import Image
import io
import json
from pathlib import Path

# Try to import AI libraries
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

class AIFeatures:
    """AI-powered features for Anvesh"""
    
    def __init__(self):
        self.face_encodings_cache = {}
        self.yolo_model = None
        self._load_models()
    
    def _load_models(self):
        """Load AI models"""
        if YOLO_AVAILABLE:
            try:
                # Use YOLOv8n (nano) for speed, can be upgraded to YOLOv8s/m/l/x
                self.yolo_model = YOLO('yolov8n.pt')  # Will download on first use
            except Exception as e:
                print(f"Warning: Could not load YOLO model: {e}")
                self.yolo_model = None
    
    def extract_text_from_image(self, image_path: str) -> Dict:
        """Extract text from image using OCR"""
        if not TESSERACT_AVAILABLE:
            return {"error": "Tesseract OCR not available. Install: pip install pytesseract"}
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "Could not read image"}
            
            # Preprocess image for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # Apply thresholding
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Extract text
            text = pytesseract.image_to_string(thresh, lang='eng')
            data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT)
            
            # Get bounding boxes
            boxes = []
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                if int(data['conf'][i]) > 0:
                    boxes.append({
                        'text': data['text'][i],
                        'confidence': float(data['conf'][i]),
                        'left': data['left'][i],
                        'top': data['top'][i],
                        'width': data['width'][i],
                        'height': data['height'][i]
                    })
            
            return {
                "success": True,
                "text": text.strip(),
                "boxes": boxes,
                "full_text": text
            }
        except Exception as e:
            return {"error": str(e)}
    
    def extract_text_from_video(self, video_path: str, frame_interval: int = 30) -> Dict:
        """Extract text from video frames using OCR"""
        if not TESSERACT_AVAILABLE:
            return {"error": "Tesseract OCR not available"}
        
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"error": "Could not open video"}
            
            frame_count = 0
            all_text = []
            frame_texts = []
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process every Nth frame
                if frame_count % frame_interval == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    
                    text = pytesseract.image_to_string(thresh, lang='eng')
                    if text.strip():
                        all_text.append(text.strip())
                        frame_texts.append({
                            "frame": frame_count,
                            "time": frame_count / cap.get(cv2.CAP_PROP_FPS),
                            "text": text.strip()
                        })
                
                frame_count += 1
            
            cap.release()
            
            return {
                "success": True,
                "total_frames": frame_count,
                "frames_processed": len(frame_texts),
                "text": "\n\n".join(all_text),
                "frame_texts": frame_texts
            }
        except Exception as e:
            return {"error": str(e)}
    
    def detect_objects(self, image_path: str, confidence_threshold: float = 0.25) -> Dict:
        """Detect objects in image using YOLO"""
        if not YOLO_AVAILABLE or self.yolo_model is None:
            return {"error": "YOLO model not available"}
        
        try:
            results = self.yolo_model(image_path, conf=confidence_threshold)
            
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    xyxy = box.xyxy[0].cpu().numpy()
                    
                    detections.append({
                        "class": result.names[cls],
                        "confidence": conf,
                        "bbox": {
                            "x1": float(xyxy[0]),
                            "y1": float(xyxy[1]),
                            "x2": float(xyxy[2]),
                            "y2": float(xyxy[3])
                        }
                    })
            
            return {
                "success": True,
                "detections": detections,
                "count": len(detections)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def detect_faces(self, image_path: str) -> Dict:
        """Detect faces in image"""
        if not FACE_RECOGNITION_AVAILABLE:
            return {"error": "Face recognition not available"}
        
        try:
            image = face_recognition.load_image_file(image_path)
            face_locations = face_recognition.face_locations(image)
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            faces = []
            for i, (top, right, bottom, left) in enumerate(face_locations):
                faces.append({
                    "face_id": i,
                    "location": {
                        "top": int(top),
                        "right": int(right),
                        "bottom": int(bottom),
                        "left": int(left)
                    },
                    "encoding": face_encodings[i].tolist() if i < len(face_encodings) else None
                })
            
            return {
                "success": True,
                "faces": faces,
                "count": len(faces)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def detect_faces_in_video(self, video_path: str, frame_interval: int = 30) -> Dict:
        """Detect faces in video"""
        if not FACE_RECOGNITION_AVAILABLE:
            return {"error": "Face recognition not available"}
        
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"error": "Could not open video"}
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = 0
            all_faces = []
            face_tracking = {}  # Track faces across frames
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % frame_interval == 0:
                    # Convert BGR to RGB
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    face_locations = face_recognition.face_locations(rgb_frame)
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    
                    for encoding, location in zip(face_encodings, face_locations):
                        all_faces.append({
                            "frame": frame_count,
                            "time": frame_count / fps,
                            "location": {
                                "top": int(location[0]),
                                "right": int(location[1]),
                                "bottom": int(location[2]),
                                "left": int(location[3])
                            },
                            "encoding": encoding.tolist()
                        })
                
                frame_count += 1
            
            cap.release()
            
            return {
                "success": True,
                "total_frames": frame_count,
                "faces_detected": len(all_faces),
                "faces": all_faces
            }
        except Exception as e:
            return {"error": str(e)}
    
    def match_faces(self, image1_path: str, image2_path: str, threshold: float = 0.6) -> Dict:
        """Match faces between two images"""
        if not FACE_RECOGNITION_AVAILABLE:
            return {"error": "Face recognition not available"}
        
        try:
            # Load and encode faces from both images
            img1 = face_recognition.load_image_file(image1_path)
            img2 = face_recognition.load_image_file(image2_path)
            
            encodings1 = face_recognition.face_encodings(img1)
            encodings2 = face_recognition.face_encodings(img2)
            
            if len(encodings1) == 0:
                return {"error": "No faces found in first image"}
            if len(encodings2) == 0:
                return {"error": "No faces found in second image"}
            
            # Compare all faces
            matches = []
            for i, enc1 in enumerate(encodings1):
                for j, enc2 in enumerate(encodings2):
                    distance = face_recognition.face_distance([enc1], enc2)[0]
                    similarity = (1 - distance) * 100  # Convert to percentage
                    
                    matches.append({
                        "face1_index": i,
                        "face2_index": j,
                        "distance": float(distance),
                        "similarity_percentage": float(similarity),
                        "is_match": distance < threshold
                    })
            
            return {
                "success": True,
                "faces_in_image1": len(encodings1),
                "faces_in_image2": len(encodings2),
                "matches": matches,
                "best_match": max(matches, key=lambda x: x["similarity_percentage"]) if matches else None
            }
        except Exception as e:
            return {"error": str(e)}
    
    def find_matching_faces_in_folder(self, reference_image_path: str, folder_path: str, threshold: float = 0.6) -> Dict:
        """Find all images in folder that contain matching faces"""
        if not FACE_RECOGNITION_AVAILABLE:
            return {"error": "Face recognition not available"}
        
        try:
            # Load reference face
            ref_img = face_recognition.load_image_file(reference_image_path)
            ref_encodings = face_recognition.face_encodings(ref_img)
            
            if len(ref_encodings) == 0:
                return {"error": "No faces found in reference image"}
            
            ref_encoding = ref_encodings[0]  # Use first face
            
            # Supported image formats
            image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}
            matches = []
            
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    if Path(file).suffix.lower() in image_extensions:
                        image_path = os.path.join(root, file)
                        try:
                            img = face_recognition.load_image_file(image_path)
                            encodings = face_recognition.face_encodings(img)
                            
                            for encoding in encodings:
                                distance = face_recognition.face_distance([ref_encoding], encoding)[0]
                                similarity = (1 - distance) * 100
                                
                                if distance < threshold:
                                    matches.append({
                                        "image_path": image_path,
                                        "similarity_percentage": float(similarity),
                                        "distance": float(distance)
                                    })
                                    break  # Found a match, move to next image
                        except Exception as e:
                            continue
            
            # Sort by similarity
            matches.sort(key=lambda x: x["similarity_percentage"], reverse=True)
            
            return {
                "success": True,
                "reference_image": reference_image_path,
                "matches_found": len(matches),
                "matches": matches
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_capabilities(self) -> Dict:
        """Get available AI capabilities"""
        return {
            "ocr": TESSERACT_AVAILABLE,
            "face_detection": FACE_RECOGNITION_AVAILABLE,
            "object_detection": YOLO_AVAILABLE and self.yolo_model is not None,
            "face_matching": FACE_RECOGNITION_AVAILABLE
        }

# Global instance
ai_features = AIFeatures()

