import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { io, Socket } from 'socket.io-client';
import Video, { videoSize } from './Video';

const VideoChat = () => {
  const localVideoRef = useRef<Webcam>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [room, setRoom] = useState('test');
  const [socket, setSocket] = useState<Socket | null>(null);
  // const { socket, setSocket } = useSocketStore();
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    // 시그널링 서버에 연결
    const nextSocket = io('http://43.200.1.142:8080/' as string);
    setSocket(nextSocket);

    // Google의 공개 STUN 서버를 사용하여 PeerConnection을 생성
    const pc: RTCPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
        {
          urls: 'stun:stun3.l.google.com:19302',
        },
      ],
    });

    // onicecandidate 이벤트 핸들러를 등록
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      nextSocket.emit('candidate', { candidate: event.candidate, room });
    };

    // ontrack 이벤트 핸들러를 등록
    pc.ontrack = (event) => {
      if (!remoteVideoRef.current || !event.streams[0]) return;
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    nextSocket.on('offer', async (msg) => {
      if (!msg) return;
      // 내가 보낸 offer인 경우, 무시
      if (msg.sender == socket?.id) return;

      // connection에 상대 Peer의 offer SDP를 설정
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

      // 설정 이후 상태 Peer에게 나의 answer SDP를 보냄
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      nextSocket.emit('answer', { sdp: answer, room });
    });

    nextSocket.on('answer', async (msg) => {
      if (!msg) return;
      // 내가 보낸 answer인 경우, 무시
      if (msg.sender == socket?.id) return;

      // connection에 상대 Peer의 answer SDP를 설정
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    });

    nextSocket.on('candidate', async (msg) => {
      if (!msg) return;
      // connection에 상대 Peer의 candidate를 추가
      await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    });

    nextSocket.on('filter', async (msg) => {
      if (!msg || !remoteCanvasRef.current) return;
      const ctx = remoteCanvasRef.current.getContext('2d');
      if (!ctx) return;
      const image = new Image();
      image.src = `/filter/sunglasses.png`;

      ctx.clearRect(0, 0, videoSize.width, videoSize.height);
      ctx.drawImage(image, msg.x, msg.y, msg.width, msg.height);
    });

    setPeerConnection(pc);
  }, []);

  const startVideo = async () => {
    if (!localVideoRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // localVideoRef.current.srcObject = stream;
    localVideoRef.current.stream = stream;
    stream
      .getTracks()
      .forEach((track) => peerConnection?.addTrack(track, stream));

    setIsStarted(true);
  };

  const joinRoom = () => {
    if (!socket || !room) return;
    socket.emit('join', { room });
  };

  const call = async () => {
    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);
    socket?.emit('offer', { sdp: offer, room });
  };
  if (!socket) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-2">
        <div className="flex flex-col items-center">
          <div className="font-semibold">내 화면</div>
          <Video socket={socket} ref={localVideoRef} />
        </div>
        <div className="flex flex-col items-center">
          <div className="font-semibold">상대 화면</div>
          <div className="relative w-fit h-fit">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              width={videoSize.width}
              height={videoSize.height}
            />
            <canvas
              ref={remoteCanvasRef}
              className="absolute top-0 left-0"
              width={videoSize.width}
              height={videoSize.height}
            ></canvas>
          </div>
        </div>
      </div>
      <div className="text-center font-semibold">Room Name: {room}</div>
      <div className="justify-center flex items-center gap-6">
        {!isStarted && (
          <button
            className="shadow-md px-3 py-2 rounded hover:bg-slate-50 active:shadow-none"
            onClick={() => {
              startVideo();
              joinRoom();
            }}
          >
            비디오 연결
          </button>
        )}
        <button
          className="shadow-md px-3 py-2 rounded hover:bg-slate-50 active:shadow-none"
          onClick={call}
        >
          통화 시작
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
