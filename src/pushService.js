// pushService.js
const VAPID_PUBLIC_KEY = import.meta.env.VITE_APP_VAPID_PUBLIC_KEY;
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log("Push notifikacije nisu podržane na ovom uređaju.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log("Korisnik nije dozvolio notifikacije.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  }

  // Pošalji subscription na Ktor backend
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}