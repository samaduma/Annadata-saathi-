import React, { useState } from 'react';

const DocumentUpload = ({ landId, onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !landId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Updated URL to match the backend router prefix
            const response = await fetch(`http://127.0.0.1:8002/api/feature1/document/upload?land_id=${landId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onUploadComplete(data); // Backend now returns the single object directly
        } catch (error) {
            console.error(error);
            alert("Error uploading document");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-800">
            <h3 className="text-lg font-bold mb-2">Upload Land Document</h3>
            <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mb-4"
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading || !landId}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Upload & Verify'}
            </button>
        </div>
    );
};

export default DocumentUpload;
