import ImageLayer from 'ol/layer/Image.js';
import Static from 'ol/source/ImageStatic.js';
import {transformExtent} from 'ol/proj';

export default async function getImageLayer(layer_store, layer_name, setVisible = false, style = '', containerName) {
  let wmsLayer = null;

  try {
    console.log('Layer store:', layer_store);
    console.log('Layer name:', layer_name);
    console.log('Container:', containerName);

    const extentJsonUrl = `http://localhost:3000/containers/${containerName}/image_layers/${layer_name}.json`;
    
    console.log('Fetching extent from:', extentJsonUrl);
    const result = await fetch(extentJsonUrl);
    
    if (!result.ok) {
      throw new Error(`Failed to fetch extent JSON: ${result.status} ${result.statusText}`);
    }
    
    const imageJsonData = await result.json();
    console.log('Image JSON data:', imageJsonData);

    // The bbox from your JSON is in EPSG:4326 (WGS84) format: [minX, minY, maxX, maxY]
    const extent = imageJsonData.bbox;
    console.log('Image extent (EPSG:4326):', extent);

    const imageUrl = `http://localhost:3000/containers/${containerName}/image_layers/${layer_name}.png`;

    console.log('Image URL:', imageUrl);

    // Create the image layer with EPSG:4326 projection
    wmsLayer = new ImageLayer({
      source: new Static({
        url: imageUrl,
        projection: 'EPSG:4326', // Use standard WGS84 projection
        imageExtent: extent, // Your extent is already in EPSG:4326
        crossOrigin: 'anonymous', // Add this to avoid CORS issues
      }),
      visible: true,
      opacity: 1.0
    });

    console.log('✅ Image layer created successfully');

  } catch (err) {
    console.error('❌ Error occurred while loading the image layer:', err);
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    return null;
  }

  return wmsLayer;
}