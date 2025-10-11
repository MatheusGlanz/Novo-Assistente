self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon.png', // O ícone que aparecerá na notificação
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});