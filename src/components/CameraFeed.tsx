
import React, { useEffect, useState } from "react";

interface CameraFeedProps {
  className?: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ className }) => {
  const [fallDetected, setFallDetected] = useState(false);

  useEffect(() => {
    const pollFallStatus = () => {
      fetch("http://localhost:5000/fall_status")
        .then((res) => res.json())
        .then((data) => {
          setFallDetected(data.fall_detected);
        })
        .catch(() => {
          setFallDetected(false);
        });
    };
    const interval = setInterval(pollFallStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Camera Feed</h2>
      </div>

      {/* Alert */}
      {fallDetected && (
        <div className="bg-red-600 text-white p-4 text-center font-bold animate-pulse">
          🚨 FALL DETECTED!
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex items-center justify-center bg-black aspect-video">
        <img
          src="http://localhost:5000/video_feed"
          alt="Fall Detection Feed"
          width={640}
          height={480}
          style={{ border: '2px solid #333', borderRadius: '8px' }}
        />
      </div>
    </div>
  );
};

export default CameraFeed;
