/**
 * Tengra Analytics - Lightweight GDPR-Compliant Tracking Script
 * Usage: <script src="https://tengra.studio/tengra-analytics.js" data-api="https://api.tengra.studio"></script>
 */
(function () {
    'use strict';

    // Configuration
    const script = document.currentScript;
    const apiUrl = script?.getAttribute('data-api') || 'https://api.tengra.studio';
    const autoTrack = script?.getAttribute('data-auto-track') !== 'false';

    // Simple non-persistent fingerprint (session-based, GDPR compliant)
    function generateSessionId() {
        const nav = navigator;
        const screen = window.screen;
        const base = [
            nav.userAgent,
            nav.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            nav.hardwareConcurrency || 0,
            Date.now().toString(36)
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
            const char = base.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Get referrer domain
    function getReferrer() {
        const ref = document.referrer;
        if (!ref) return '';
        try {
            const url = new URL(ref);
            if (url.hostname === window.location.hostname) return '';
            return url.hostname;
        } catch {
            return '';
        }
    }

    // Get UTM parameters
    function getUtmParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || ''
        };
    }

    // Get screen info
    function getScreenInfo() {
        return window.screen.width + 'x' + window.screen.height;
    }

    // Track page view
    function trackPageView(customPath) {
        const path = customPath || window.location.pathname;
        const utm = getUtmParams();

        const payload = {
            path: path,
            ua: navigator.userAgent,
            referrer: getReferrer(),
            screen: getScreenInfo(),
            session_id: generateSessionId(),
            ...utm
        };

        // Send via beacon API for reliability
        const url = apiUrl + '/analytics/page/increment';
        const data = JSON.stringify(payload);

        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
        } else {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data,
                keepalive: true
            }).catch(() => { });
        }
    }

    // Track custom event
    function trackEvent(eventName, properties = {}) {
        const payload = {
            path: '/_event/' + eventName,
            ua: navigator.userAgent,
            screen: getScreenInfo(),
            session_id: generateSessionId(),
            ...properties
        };

        const url = apiUrl + '/analytics/page/increment';
        const data = JSON.stringify(payload);

        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
        } else {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data,
                keepalive: true
            }).catch(() => { });
        }
    }

    // SPA navigation support
    let lastPath = window.location.pathname;
    function checkNavigation() {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
            lastPath = currentPath;
            trackPageView(currentPath);
        }
    }

    // Auto-track page views
    if (autoTrack) {
        // Initial page view
        if (document.readyState === 'complete') {
            trackPageView();
        } else {
            window.addEventListener('load', function () {
                trackPageView();
            });
        }

        // SPA support: History API
        const originalPushState = history.pushState;
        history.pushState = function () {
            originalPushState.apply(this, arguments);
            setTimeout(checkNavigation, 0);
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            setTimeout(checkNavigation, 0);
        };

        window.addEventListener('popstate', function () {
            setTimeout(checkNavigation, 0);
        });
    }

    // Expose public API
    window.tengra = {
        track: trackPageView,
        event: trackEvent,
        sessionId: generateSessionId
    };
})();
