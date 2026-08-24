import React from 'react';
import { renderToString } from 'react-dom/server';
import SectorImpact from './src/components/SectorImpact.jsx';

try {
    const html = renderToString(React.createElement(SectorImpact, {
        stats: { riskScore: 20, hotSector: 'general', marketMode: 'TW' }
    }));
    
    if (html.includes('QQQ')) {
        console.log("BUG: QQQ is in the HTML!");
    } else if (html.includes('2330')) {
        console.log("SUCCESS: 2330 is in the HTML.");
    } else {
        console.log("Neither found? HTML:", html.substring(0, 500));
    }
} catch (e) {
    console.error("Crash during render:", e);
}
