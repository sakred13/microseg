import cv2


# https://machinelearningmastery.com/how-to-perform-face-detection-with-classical-and-deep-learning-methods-in-python-with-keras/
def detect_faces(mat):
  classifier = cv2.CascadeClassifier('./processor/haarcascade_frontalface_default.xml')

  aabbs = classifier.detectMultiScale(mat) # Axis-Aligned Bounding Boxes
  for box in aabbs:
    # print(box)
    x, y, width, height = box
    x2, y2 = x + width, y + height
    cv2.rectangle(mat, (x,y), (x2,y2), (0,0,255), 1)

if __name__ == '__main__':
  print(__name__)
  mat = cv2.imread('first_roar.png')
  detect_faces(mat)
  cv2.imshow('face detection', mat)
  cv2.waitKey(0)
  cv2.destroyAllWindows()

