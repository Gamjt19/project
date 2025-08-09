import React from "react";

interface CameraFeedProps {
  className?: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Camera Feed</h2>
      </div>

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
