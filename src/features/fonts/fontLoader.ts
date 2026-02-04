import WebFont from 'webfontloader';

export const loadFonts = (families: string[]): Promise<void> => {
    return new Promise((resolve) => {
        if (families.length === 0) {
            resolve();
            return;
        }

        WebFont.load({
            google: {
                families,
            },
            active: () => {
                console.log('Fonts loaded:', families);
                resolve();
            },
            inactive: () => {
                console.warn('Failed to load fonts:', families);
                resolve();
            },
            fontactive: () => {
                // Individual font loaded
            },
            timeout: 5000
        });
    });

};

// Fallback stack locked to ensure no layout shift if load fails
export const FALLBACK_FONT = 'Arial, sans-serif';
