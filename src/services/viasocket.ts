import { ViaSocketRequestPayload, ViaSocketResponsePayload } from '../types';

/**
 * ViaSocket Webhook Service
 * Handles communication with the ViaSocket automation flow
 */
export async function sendToViaSocketWebhook(
  webhookUrl: string,
  payload: ViaSocketRequestPayload
): Promise<ViaSocketResponsePayload> {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('ViaSocket webhook URL is not configured.');
  }

  const response = await fetch(webhookUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`ViaSocket webhook returned status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data as ViaSocketResponsePayload;
}

/**
 * Upload ledger image to ViaSocket webhook (supports multipart or base64)
 */
export async function uploadImageToViaSocket(
  webhookUrl: string,
  imageFile: File,
  metadata: Record<string, unknown>
): Promise<ViaSocketResponsePayload> {
  if (!webhookUrl || !webhookUrl.trim()) {
    throw new Error('ViaSocket webhook URL is not configured.');
  }

  // Convert image to base64 for reliable JSON transport or FormData
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const payload: ViaSocketRequestPayload = {
          source: 'expenso',
          input_type: 'image',
          raw_input: `[Image: ${imageFile.name}, size: ${Math.round(imageFile.size / 1024)} KB]`,
          language: 'hinglish',
          timestamp: new Date().toISOString(),
          store_id: 'store_rajesh_01',
          user_id: 'user_rajesh',
          metadata: {
            ...metadata,
            fileName: imageFile.name,
            fileType: imageFile.type,
            fileSize: imageFile.size,
            imageBase64: base64Data,
          },
        };

        const result = await sendToViaSocketWebhook(webhookUrl, payload);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(imageFile);
  });
}
