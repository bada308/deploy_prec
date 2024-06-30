import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';

export const loadFaceDetectionModel = () => {
  return faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'tfjs',
      maxFaces: 1, // 인식할 얼굴의 최대 개수
      refineLandmarks: true, // 랜드마크를 더 정교하게 인식할지 여부
    },
  );
};
