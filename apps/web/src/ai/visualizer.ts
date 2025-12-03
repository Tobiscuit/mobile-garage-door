export interface VisualizationResult {
  success: boolean;
  result?: string; // Base64 image or URL
  error?: string;
  ai_metadata?: any;
}

export class GarageDoorVisualizer {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async processImage(imageFile: File, doorId: string): Promise<VisualizationResult> {
    console.log(`[Visualizer] Processing image for door ${doorId}...`);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('doorId', doorId);

      const response = await fetch(`${this.apiUrl}/visualize`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('[Visualizer] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const visualizer = new GarageDoorVisualizer();
