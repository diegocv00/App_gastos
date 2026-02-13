export const useAdMob = () => {
    const showInterstitial = () => {
        console.log("⚡ Iniciando protocolo de anuncio...");

        try {
            // 1. Intentar API Median/Gonative JS Bridge
            const bridge = (window as any).median || (window as any).gonative;
            if (bridge?.admob) {
                console.log("✅ Bridge detected.");
                if (typeof bridge.admob.showInterstitialIfReady === 'function') {
                    bridge.admob.showInterstitialIfReady();
                    return;
                } else if (typeof bridge.admob.showInterstitial === 'function') {
                    bridge.admob.showInterstitial();
                    return;
                }
            }

            // 2. Fallback: URL Schemes
            console.log("⚠️ Bridge no disponible o incompatible. Usando esquemas nativos...");
            window.location.href = "median://admob/interstitial/show";

            setTimeout(() => {
                window.location.href = "gonative://admob/interstitial/show";
            }, 100);

        } catch (error) {
            console.error("❌ Fallo crítico al mostrar anuncio:", error);
        }
    };

    return { showInterstitial };
};