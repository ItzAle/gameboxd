import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";

const AvatarCropper = ({ image, onSave, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const editorRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [image]);

  useEffect(() => {
    if (imageLoaded && editorRef.current) {
      const img = editorRef.current.getImage();
      if (img && img.width && img.height) {
        const initialScale = Math.max(250 / img.width, 250 / img.height);
        setScale(initialScale);
      }
    }
  }, [imageLoaded]);

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const base64Image = canvas.toDataURL("image/jpeg");
      onSave(base64Image);
    }
  };

  const handlePositionChange = (position) => {
    setPosition(position);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Recortar Avatar</h2>
        <div className="mb-4 relative">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={250}
            height={250}
            border={0}
            borderRadius={125}
            color={[0, 0, 0, 0.6]}
            scale={scale}
            position={position}
            onPositionChange={handlePositionChange}
            onImageReady={handleImageLoad}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="zoom"
            className="block text-sm font-medium text-gray-300"
          >
            Zoom
          </label>
          <input
            type="range"
            id="zoom"
            min={1}
            max={3}
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Guardar Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropper;
