import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Sparkles } from 'lucide-react';
import { useArtists } from '../contexts/ArtistContext';
import { mockAnalyzeNailImage, findMatchingArtists } from '../services/aiService';
import toast from 'react-hot-toast';

const ImageUploadModal = ({ onClose, onSuccess }) => {
  const { allArtists } = useArtists();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleAIAnalysis = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      // Use AI service to analyze the image
      const analysis = await mockAnalyzeNailImage(uploadedFile);
      
      // Find matching artists
      const matchingArtists = findMatchingArtists(analysis, allArtists);
      
      const results = {
        detectedStyles: analysis.detectedStyles,
        confidence: analysis.confidence,
        similarArtists: matchingArtists.slice(0, 5) // Top 5 matches
      };
      
      setAnalysisResults(results);
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('AI Analysis Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewMatches = () => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Style Matching</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!uploadedFile && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-pink-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                {isDragActive
                  ? 'Drop your nail inspiration here'
                  : 'Drag & drop your nail inspiration photo here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files (max 10MB)
              </p>
            </div>
          )}

          {uploadedFile && !analysisResults && (
            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded nail inspiration"
                  className="max-w-full h-64 object-cover rounded-lg mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">{uploadedFile.name}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAIAnalysis}
                  disabled={isProcessing}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose Different Photo
                </button>
              </div>
            </div>
          )}

          {analysisResults && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Analysis Complete!</span>
                </div>
                <p className="text-green-700 mt-1">
                  Confidence: {Math.round(analysisResults.confidence * 100)}%
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detected Styles:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.detectedStyles.map((style, index) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Matching Artists:</h3>
                <div className="space-y-3">
                  {analysisResults.similarArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{artist.name}</p>
                        <p className="text-sm text-gray-600">{artist.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-pink-600">
                          {Math.round(artist.matchScore * 100)}% match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleViewMatches}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  View All Matches
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setAnalysisResults(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Another Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
