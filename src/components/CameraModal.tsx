import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment' // Use the rear camera
};

export default function CameraModal({ onClose, onCapture }: CameraModalProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onClose();
    }
  }, [webcamRef, onCapture, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4">
        <Webcam
          audio={false}
          height={360}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          videoConstraints={videoConstraints}
        />
        <div className="flex justify-center mt-4">
          <button onClick={capture} className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">撮影</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">キャンセル</button>
        </div>
      </div>
    </div>
  );
}
