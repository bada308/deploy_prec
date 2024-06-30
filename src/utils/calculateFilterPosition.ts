import { Keypoint } from '@tensorflow-models/face-landmarks-detection';

const facePoint = {
  leftEyeTop: 124,
  rightEyeTop: 276,
  leftEyeBottom: 111,
};

export const sunglassesFilterPosition = (keypoints: Keypoint[]) => {
  // 필터 위치 조정을 위한 패딩
  const padding = {
    x: 30,
    y: 10,
  };

  // 필터의 x 위치: 왼쪽 눈 상단 지점의 x 좌표에서 가로 여백을 뺀 값
  const x = keypoints[facePoint.leftEyeTop].x - padding.x;
  // 필터의 y 위치: 왼쪽 눈 상단 지점의 y 좌표에서 세로 여백을 뺀 값
  const y = keypoints[facePoint.leftEyeTop].y - padding.y;

  // 필터의 너비: 오른쪽 눈 상단 지점의 x 좌표에서 왼쪽 눈 상단 지점의 x 좌표를 뺀 후, 양쪽에 가로 여백을 더한 값
  const width =
    keypoints[facePoint.rightEyeTop].x -
    keypoints[facePoint.leftEyeTop].x +
    padding.x * 2;

  // 필터의 높이: 왼쪽 눈 하단 지점의 y 좌표에서 왼쪽 눈 상단 지점의 y 좌표를 뺀 후, 양쪽에 세로 여백을 더한 값
  const height =
    keypoints[facePoint.leftEyeBottom].y -
    keypoints[facePoint.leftEyeTop].y +
    padding.y * 2;

  // 필터의 위치와 크기를 반환
  return {
    x,
    y,
    width,
    height,
  };
};
