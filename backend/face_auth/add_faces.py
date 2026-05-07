import cv2
import pickle
import numpy as np
import os
video = cv2.VideoCapture(0)
facedetect = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
if facedetect.empty():
    print("Error loading Haar cascade file.")
    exit()
faces_data = []
if not os.path.exists('test'):
    os.makedirs('test')
name = input("Enter your name: ")
i = 0
while True:
    ret, frame = video.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = facedetect.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    for (x, y, w, h) in faces:
        crop_img = frame[y:y + h, x:x + w, :]
        resized_img = cv2.resize(crop_img, (50, 50))
        if len(faces_data) < 50 and i % 10 == 0:
            faces_data.append(resized_img)
            cv2.imwrite(f'test/{name}_{len(faces_data)}.jpg', resized_img)
        i = i + 1
        cv2.putText(frame, str(len(faces_data)), (50, 50), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (50, 50, 255), 1)
    cv2.imshow("Frame", frame)
    if cv2.waitKey(1) & 0xFF == ord("o"): 
        break

video.release()
cv2.destroyAllWindows()
faces_data = np.asarray(faces_data)

if faces_data.shape[0] > 0:  
    faces_data = faces_data.reshape(faces_data.shape[0], -1)
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    if "names.pkl" not in os.listdir(data_dir):
        names = [name] * len(faces_data)
        with open(os.path.join(data_dir, "names.pkl"), "wb") as f:
            pickle.dump(names, f)
    else:
        with open(os.path.join(data_dir, "names.pkl"), "rb") as f:
            names = pickle.load(f)
        names = names + [name] * len(faces_data)
        with open(os.path.join(data_dir, "names.pkl"), "wb") as f:
            pickle.dump(names, f)

    if "faces_data.pkl" not in os.listdir(data_dir):
        with open(os.path.join(data_dir, "faces_data.pkl"), "wb") as f:
            pickle.dump(faces_data, f)
    else:
        with open(os.path.join(data_dir, "faces_data.pkl"), "rb") as f:
            faces = pickle.load(f)
        faces = np.append(faces, faces_data, axis=0)
        with open(os.path.join(data_dir, "faces_data.pkl"), "wb") as f:
            pickle.dump(faces, f)
