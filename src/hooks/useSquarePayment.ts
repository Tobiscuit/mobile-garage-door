import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Square: any;
  }
}

export function useSquarePayment(
  shouldInitialize: boolean,
  appId: string,
  locationId: string,
  containerId: string = '#card-container'
) {
  const [card, setCard] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cardInstance: any;

    async function initializeCard() {
      if (!window.Square) return;
      if (card) return; // Already initialized

      try {
        const payments = await window.Square.payments(appId, locationId);
        cardInstance = await payments.card();
        await cardInstance.attach(containerId);
        setCard(cardInstance);
      } catch (e: any) {
        console.error('Square Init Error:', e);
        setError('Failed to load payment form. Please refresh.');
      }
    }

    if (shouldInitialize && sdkLoaded) {
      initializeCard();
    }

    return () => {
      // Cleanup if necessary (Square Web SDK might not have a destroy method on card instance easily accessible in this scope)
      // but usually frameworks handle DOM removal.
      if (cardInstance) {
        // cardInstance.destroy(); // Verify if destroy exists in latest SDK
      }
    };
  }, [shouldInitialize, sdkLoaded, appId, locationId, containerId, card]);

  const tokenizeCard = async (): Promise<string> => {
    if (!card) throw new Error('Payment form not initialized');

    const result = await card.tokenize();
    if (result.status !== 'OK') {
      throw new Error(`Payment Failed: ${result.errors[0].message}`);
    }
    return result.token;
  };

  return {
    card,
    sdkLoaded,
    setSdkLoaded,
    error,
    tokenizeCard,
  };
}
