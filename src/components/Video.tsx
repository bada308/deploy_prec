import { FaceLandmarksDetector } from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam';
import { sunglassesFilterPosition } from '../utils/calculateFilterPosition';
import {
  ForwardedRef,
  forwardRef,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { loadFaceDetectionModel } from '../utils/loadModel';
import { Socket } from 'socket.io-client';

export const videoSize = {
  width: 640,
  height: 480,
};

const Video = forwardRef(
  ({ socket }: { socket: Socket }, ref: ForwardedRef<Webcam>) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initialLoadedRef = useRef(false);
    const [status, setStatus] = useState<
      'Initializing...' | 'Load Model...' | 'Model Loaded'
    >('Initializing...');

    const estimateFacesLoop = (
      model: FaceLandmarksDetector,
      image: HTMLImageElement,
      ctx: CanvasRenderingContext2D,
    ) => {
      const video = webcamRef.current?.video;
      if (!video) return;

      model.estimateFaces(video).then((face) => {
        // 캔버스 초기화
        ctx.clearRect(0, 0, videoSize.width, videoSize.height);

        if (face[0]) {
          const { x, y, width, height } = sunglassesFilterPosition(
            face[0].keypoints,
          );

          // 필터 이미지를 그림
          ctx.drawImage(image, x, y, width, height);
          socket?.emit('filter', {
            room: 'test',
            type: 'sunglasses',
            x,
            y,
            width,
            height,
          });
        }

        // 재귀 호출
        requestAnimationFrame(() => {
          estimateFacesLoop(model, image, ctx);
        });
      });
    };

    useEffect(() => {
      const canvasContext = canvasRef.current?.getContext('2d');
      if (!canvasContext || initialLoadedRef.current) return;

      initialLoadedRef.current = true;
      const image = new Image();
      image.src = '/filter/sunglasses.png';

      image.onload = () => {
        setStatus('Load Model...');
      };
      // 인식 모델 로드
      loadFaceDetectionModel().then((model) => {
        requestAnimationFrame(() =>
          estimateFacesLoop(model, image, canvasContext),
        );
        setStatus('Model Loaded');
      });
    }, []);

    useEffect(() => {
      if (typeof ref === 'function') {
        ref(webcamRef.current);
      } else if (ref) {
        ref.current = webcamRef.current;
      }
    }, [ref]);

    return (
      <div className="relative w-fit h-fit">
        <Webcam
          width={videoSize.width}
          height={videoSize.height}
          ref={webcamRef}
        />
        <canvas
          width={videoSize.width}
          height={videoSize.height}
          className="absolute top-0 left-0"
          ref={canvasRef}
        />
        <p className="absolute bottom-2 left-2 text-white">{status}</p>
      </div>
    );
  },
);

export default Video;
