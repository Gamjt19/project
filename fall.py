from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import time
import winsound


# Flask app setup
app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

fall_alert = False
fall_detected = False
fall_start_time = 0
FALL_THRESHOLD = 10  # Seconds

def gen_frames():
    global fall_alert, fall_detected, fall_start_time
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            continue

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            landmarks = results.pose_landmarks.landmark
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
            avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            avg_hip_y = (left_hip.y + right_hip.y) / 2
            if abs(avg_hip_y - avg_shoulder_y) < 0.1:
                if not fall_detected:
                    fall_start_time = time.time()
                    fall_detected = True
                elif time.time() - fall_start_time > FALL_THRESHOLD:
                    cv2.putText(image, 'FALL DETECTED!', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
                    if not fall_alert:
                        winsound.Beep(2000, 1000)
                        fall_alert = True
            else:
                fall_detected = False
                fall_alert = False

        ret, buffer = cv2.imencode('.jpg', image)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/fall_status')
def fall_status():
    global fall_alert
    return jsonify({'fall_detected': fall_alert})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
