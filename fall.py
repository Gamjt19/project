from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import time
import winsound
import math

# Flask app setup
app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

fall_alert = False
fall_detected = False
fall_start_time = 0
last_avg_hip_y = None
last_move_time = time.time()

FALL_THRESHOLD = 3      # Seconds staying down before alert
SPEED_THRESHOLD = 0.015  # How fast hips drop (tune this)
STILLNESS_THRESHOLD = 0.002  # Movement allowed when lying still

def gen_frames():
    global fall_alert, fall_detected, fall_start_time, last_avg_hip_y, last_move_time
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            continue

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            landmarks = results.pose_landmarks.landmark

            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]

            avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            avg_hip_y = (left_hip.y + right_hip.y) / 2

            # Detect speed of hip drop
            if last_avg_hip_y is not None:
                drop_speed = abs(avg_hip_y - last_avg_hip_y)

                # Check if body is horizontal
                horizontal = abs(avg_hip_y - avg_shoulder_y) < 0.1

                # If horizontal & drop was fast -> possible fall
                if horizontal and drop_speed > SPEED_THRESHOLD:
                    if not fall_detected:
                        fall_start_time = time.time()
                        fall_detected = True

                # Track movement to ignore sleeping
                movement_amount = abs(avg_hip_y - last_avg_hip_y)
                if movement_amount > STILLNESS_THRESHOLD:
                    last_move_time = time.time()

                # If already in "fall" state, check how long still
                if fall_detected:
                    if time.time() - fall_start_time > FALL_THRESHOLD and time.time() - last_move_time > FALL_THRESHOLD:
                        cv2.putText(image, 'FALL DETECTED!', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
                        if not fall_alert:
                            winsound.Beep(2000, 1000)
                            fall_alert = True
                else:
                    fall_alert = False

            last_avg_hip_y = avg_hip_y

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
