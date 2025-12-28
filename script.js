// Google Analytics Event Tracking
function trackEvent(eventName, parameters = {}) {
    gtag('event', eventName, parameters);
}

// Track phone and WhatsApp clicks
document.addEventListener('DOMContentLoaded', function() {
    const phoneLink = document.getElementById('phone-link');
    const whatsappLink = document.getElementBy