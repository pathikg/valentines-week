import { useEffect, useRef, useState } from 'react';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';

const ValentineARCamera = ({ onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const animationFrameRef = useRef(null);

  // Initialize camera and model
  useEffect(() => {
    const init = async () => {
      try {
        // Load face detection model
        const loadedModel = await blazeface.load();
        setModel(loadedModel);

        // Get camera stream with higher resolution
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 960 }
          }
        });
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Explicitly play the video
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      } catch (err) {
        console.error('Error initializing camera:', err);
        setError('Could not access camera. Please allow camera permissions.');
      }
    };

    init();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start detection loop when model and video are ready
  useEffect(() => {
    if (!model || !videoRef.current || !videoReady) return;

    // Initialize canvas size
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
    }

    const detectFaces = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const predictions = await model.estimateFaces(videoRef.current, false);
        drawFrame(predictions);
      }
      animationFrameRef.current = requestAnimationFrame(detectFaces);
    };

    detectFaces();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [model, videoReady]);

  const drawFrame = (predictions) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size to match video if not already set
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw crown emoji if face detected
    if (predictions.length > 0) {
      predictions.forEach(prediction => {
        const start = prediction.topLeft;
        const end = prediction.bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        // Draw crown emoji above head
        const crownSize = size[0] * 0.8;
        const crownX = start[0] + size[0] / 2;
        const crownY = start[1] - 20;

        ctx.font = `${crownSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('👑', crownX, crownY);
      });
    }

    // Draw "Happy Valentine's Day" text at bottom (two lines)
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#FF1493';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    const textY = canvas.height - 70;
    ctx.strokeText("Happy Valentine's Day,", canvas.width / 2, textY);
    ctx.fillText("Happy Valentine's Day,", canvas.width / 2, textY);
    ctx.strokeText("My Queen! 💕", canvas.width / 2, textY + 50);
    ctx.fillText("My Queen! 💕", canvas.width / 2, textY + 50);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      setCaptured(imageData);
    }
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold"
        >
          Close
        </button>
      </div>
    );
  }

  if (captured) {
    return (
      <div className="text-center">
        <img src={captured} alt="Captured" className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl mb-4" />
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setCaptured(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold"
          >
            Retake
          </button>
          <a
            href={captured}
            download="valentine-day.png"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-bold"
          >
            Download 💕
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => setVideoReady(true)}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl mb-4"
        style={{ backgroundColor: '#000' }}
      />
      {(!model || !videoReady) && (
        <p className="text-center text-gray-600 mb-4">Loading face detection... ✨</p>
      )}
      <div className="flex gap-4 justify-center">
        <button
          onClick={capturePhoto}
          disabled={!model}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📸 Capture Photo
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ValentineARCamera;
