import configPromise from '@payload-config';
import { getPayloadAuth } from 'payload-auth/better-auth';

// This safely caches and returns Payload wrapped with the BetterAuth instance seamlessly.
let cachedPayload: any = null;

export const getPayload = async () => {
    if (cachedPayload) return cachedPayload;
    cachedPayload = await getPayloadAuth(configPromise);
    return cachedPayload;
};

// Aliasing the getPayload function as getPayloadClient so we don't break existing layout modules
export const getPayloadClient = getPayload;
