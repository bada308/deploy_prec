import Webcam from 'react-webcam';

const videoSize = {
  width: 1280,
  height: 720,
};

const Video = () => {
  return (
    <div className="relative w-fit h-fit">
      <Webcam width={videoSize.width} height={videoSize.height} />
      <canvas
        width={videoSize.width}
        height={videoSize.height}
        className="absolute top-0 left-0"
      />
    </div>
  );
};

export default Video;
