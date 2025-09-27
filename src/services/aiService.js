// AI Service for nailXpress V2
// This service handles AI-powered image analysis and artist matching

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const REPLICATE_API_TOKEN = process.env.REACT_APP_REPLICATE_API_TOKEN;

// CLIP model configuration
const CLIP_MODEL = 'andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a';

/**
 * Analyze a nail image using CLIP model to extract style features
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<Object>} - Analysis results with detected styles and features
 */
export const analyzeNailImage = async (imageFile) => {
  try {
    // Convert file to base64 for API
    const base64Image = await fileToBase64(imageFile);
    
    // Prepare the request payload
    const payload = {
      version: CLIP_MODEL,
      input: {
        image: base64Image,
        text: "nail art, french tips, gel extensions, nail design, manicure, pedicure, nail polish, nail art design, nail technician, nail salon"
      }
    };

    // Call Replicate API
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Process the results to extract meaningful style information
    const analysisResults = processClipResults(result);
    
    return analysisResults;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

/**
 * Find matching artists based on style analysis
 * @param {Object} styleAnalysis - Results from analyzeNailImage
 * @param {Array} artists - Array of artist profiles
 * @returns {Array} - Sorted array of matching artists
 */
export const findMatchingArtists = (styleAnalysis, artists) => {
  try {
    const matches = artists.map(artist => {
      const matchScore = calculateMatchScore(styleAnalysis, artist);
      return {
        ...artist,
        matchScore,
        matchingStyles: findMatchingStyles(styleAnalysis.detectedStyles, artist.styles)
      };
    });

    // Sort by match score (highest first)
    return matches
      .filter(match => match.matchScore > 0.3) // Only include relevant matches
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Artist Matching Error:', error);
    return [];
  }
};

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Process CLIP model results to extract meaningful style information
 * @param {Object} clipResult - Raw CLIP model output
 * @returns {Object} - Processed analysis results
 */
const processClipResults = (clipResult) => {
  // This is a simplified version - in production, you'd have more sophisticated processing
  const detectedStyles = extractStylesFromFeatures(clipResult.output);
  
  return {
    detectedStyles,
    confidence: calculateConfidence(clipResult.output),
    features: clipResult.output,
    timestamp: new Date().toISOString()
  };
};

/**
 * Extract style categories from CLIP features
 * @param {Array} features - CLIP feature vector
 * @returns {Array} - Array of detected style strings
 */
const extractStylesFromFeatures = (features) => {
  // This is a mock implementation - in production, you'd use a trained classifier
  const styleCategories = [
    'French Tips', 'Gel Extensions', 'Nail Art', 'Ombre', 'Glitter',
    'Acrylic', 'Dip Powder', 'Stiletto', 'Coffin', 'Almond',
    'Square', 'Round', 'Ballerina', 'Lipstick', 'Flare'
  ];
  
  // Mock detection based on feature analysis
  const detectedStyles = [];
  const randomStyles = Math.floor(Math.random() * 3) + 1; // 1-3 styles
  
  for (let i = 0; i < randomStyles; i++) {
    const randomStyle = styleCategories[Math.floor(Math.random() * styleCategories.length)];
    if (!detectedStyles.includes(randomStyle)) {
      detectedStyles.push(randomStyle);
    }
  }
  
  return detectedStyles;
};

/**
 * Calculate confidence score from CLIP features
 * @param {Array} features - CLIP feature vector
 * @returns {number} - Confidence score between 0 and 1
 */
const calculateConfidence = (features) => {
  // Mock confidence calculation
  return Math.random() * 0.3 + 0.7; // 0.7 to 1.0
};

/**
 * Calculate match score between style analysis and artist profile
 * @param {Object} styleAnalysis - Style analysis results
 * @param {Object} artist - Artist profile
 * @returns {number} - Match score between 0 and 1
 */
const calculateMatchScore = (styleAnalysis, artist) => {
  if (!artist.styles || artist.styles.length === 0) {
    return 0;
  }
  
  const matchingStyles = findMatchingStyles(styleAnalysis.detectedStyles, artist.styles);
  const styleMatchRatio = matchingStyles.length / styleAnalysis.detectedStyles.length;
  
  // Base score from style matching
  let score = styleMatchRatio * 0.8;
  
  // Bonus for exact style matches
  const exactMatches = styleAnalysis.detectedStyles.filter(style => 
    artist.styles.includes(style)
  ).length;
  
  score += (exactMatches / styleAnalysis.detectedStyles.length) * 0.2;
  
  return Math.min(score, 1.0);
};

/**
 * Find matching styles between detected styles and artist specialties
 * @param {Array} detectedStyles - Styles detected in the image
 * @param {Array} artistStyles - Artist's specialties
 * @returns {Array} - Array of matching style strings
 */
const findMatchingStyles = (detectedStyles, artistStyles) => {
  return detectedStyles.filter(style => 
    artistStyles.some(artistStyle => 
      artistStyle.toLowerCase().includes(style.toLowerCase()) ||
      style.toLowerCase().includes(artistStyle.toLowerCase())
    )
  );
};

/**
 * Mock AI analysis for development/testing
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<Object>} - Mock analysis results
 */
export const mockAnalyzeNailImage = async (imageFile) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockStyles = [
    'French Tips', 'Gel Extensions', 'Nail Art', 'Ombre', 'Glitter',
    'Acrylic', 'Dip Powder', 'Stiletto', 'Coffin', 'Almond'
  ];
  
  const detectedStyles = mockStyles
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 1);
  
  return {
    detectedStyles,
    confidence: Math.random() * 0.3 + 0.7,
    features: Array.from({ length: 512 }, () => Math.random()),
    timestamp: new Date().toISOString()
  };
};

/**
 * Get AI service status and configuration
 * @returns {Object} - Service status information
 */
export const getAIServiceStatus = () => {
  return {
    isConfigured: !!REPLICATE_API_TOKEN,
    model: CLIP_MODEL,
    apiUrl: REPLICATE_API_URL,
    features: [
      'Style Detection',
      'Artist Matching',
      'Confidence Scoring',
      'Feature Extraction'
    ]
  };
};
