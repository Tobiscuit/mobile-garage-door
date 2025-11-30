import { NanoBanana2 } from '@google/nano-banana-2-webgpu'

// We need to define the type for navigator.connection since it's not standard in all TS environments yet
interface NetworkInformation extends EventTarget {
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  saveData?: boolean;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export async function inpaintGarageDoor(image: Blob, doorId: string) {
  // Smart Loading Logic
  const nav = navigator as NavigatorWithConnection;
  const connectionType = nav.connection?.type;

  // Note: navigator.gpu is available in secure contexts in supported browsers
  // We assume the type definition is available or we cast it.
  const hasGPU = !!(navigator as any).gpu;

  console.log(`Connection: ${connectionType}, GPU: ${hasGPU}`);

  // Check if we should use Client-Side (Wi-Fi + GPU)
  // connection.type is experimental, effectiveType is more standard but 'wifi' is specific.
  // The prompt explicitly asks for "Wi-Fi" check.
  const isWifi = connectionType === 'wifi' || nav.connection?.effectiveType === '4g'; // Fallback logic if needed, but sticking to prompt's logic mainly

  // Prompt Logic: "If isWifi and hasGPU"
  // I will stick strictly to the prompt's condition but be robust.
  const shouldUseClientSide = connectionType === 'wifi' && hasGPU;

  if (shouldUseClientSide) {
    console.log('Using Client-Side Inference (WebGPU)');
    try {
      // Zero Latency Path
      // In a real app, the URL would be configured properly.
      const model = await NanoBanana2.load('http://localhost:3001/model/weights');
      return await model.inpaint(image, { prompt: `garage door style ${doorId}` });
    } catch (e) {
      console.error('Client-side inference failed, falling back to server', e);
      return fallbackToServer(image, doorId);
    }
  } else {
    console.log('Using Server-Side Inference (Fallback)');
    // Data Saver / Legacy Path
    return fallbackToServer(image, doorId);
  }
}

async function fallbackToServer(image: Blob, doorId: string) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('doorId', doorId);

  const response = await fetch('http://localhost:3001/visualize', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Server inference failed');
  }

  return response.json();
}
