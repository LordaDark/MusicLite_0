import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Simple image generator for playlists
export const generatePlaylistImage = async (
  name: string,
  colors: string[] = ['#1DB954', '#9C27B0', '#3F51B5'],
): Promise<string> => {
  try {
    // For web, we can't generate images, so return a placeholder
    if (Platform.OS === 'web') {
      // Return a placeholder image URL
      return `https://via.placeholder.com/300x300/${colors[0].replace('#', '')}/${colors[1].replace('#', '')}?text=${encodeURIComponent(name)}`;
    }
    
    // For native platforms, we'll generate a simple SVG
    const svgWidth = 300;
    const svgHeight = 300;
    
    // Create a simple SVG with gradients and shapes
    const svg = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        ${generateRandomShapes(svgWidth, svgHeight, colors)}
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${name}
        </text>
      </svg>
    `;
    
    // Save the SVG to a temporary file
    const tempDir = FileSystem.cacheDirectory + 'images/';
    const dirInfo = await FileSystem.getInfoAsync(tempDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    }
    
    const fileName = `playlist-${Date.now()}.svg`;
    const filePath = tempDir + fileName;
    
    await FileSystem.writeAsStringAsync(filePath, svg);
    
    return filePath;
  } catch (error) {
    console.error('Error generating playlist image:', error);
    // Return a default image if generation fails
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop';
  }
};

// Generate random shapes for the SVG
const generateRandomShapes = (width: number, height: number, colors: string[]): string => {
  let shapes = '';
  const numShapes = Math.floor(Math.random() * 5) + 3; // 3-7 shapes
  
  for (let i = 0; i < numShapes; i++) {
    const shapeType = Math.random() > 0.5 ? 'circle' : 'rect';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = (Math.random() * 0.5 + 0.1).toFixed(2); // 0.1-0.6
    
    if (shapeType === 'circle') {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      const r = Math.floor(Math.random() * 50) + 20; // 20-70
      
      shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />`;
    } else {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const w = Math.floor(Math.random() * 100) + 20; // 20-120
      const h = Math.floor(Math.random() * 100) + 20; // 20-120
      
      shapes += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="${opacity}" />`;
    }
  }
  
  return shapes;
};

// Generate a simple artist image
export const generateArtistImage = async (
  name: string,
  color: string = '#1DB954',
): Promise<string> => {
  try {
    // For web, return a placeholder
    if (Platform.OS === 'web') {
      return `https://via.placeholder.com/300x300/${color.replace('#', '')}?text=${encodeURIComponent(name)}`;
    }
    
    // For native platforms, generate a simple SVG
    const svg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="150" fill="${color}" />
        <text x="150" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${name.split(' ').map(word => word[0]).join('')}
        </text>
      </svg>
    `;
    
    // Save the SVG to a temporary file
    const tempDir = FileSystem.cacheDirectory + 'images/';
    const dirInfo = await FileSystem.getInfoAsync(tempDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    }
    
    const fileName = `artist-${Date.now()}.svg`;
    const filePath = tempDir + fileName;
    
    await FileSystem.writeAsStringAsync(filePath, svg);
    
    return filePath;
  } catch (error) {
    console.error('Error generating artist image:', error);
    // Return a default image if generation fails
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop';
  }
};