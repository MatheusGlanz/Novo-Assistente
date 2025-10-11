import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaBellSlash } from 'react-icons/fa';

const api = axios.create({ baseURL: 'https://assistente-backend-auus.onrender.com/api' });
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Função para converter a chave pública
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

const NotificationManager = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const VAPID_PUBLIC_KEY = 'BNvrICsc6xgjIBt0v_d_5koZyPf_wLHaKuzgFuHFEDuuhtnS_yB2vx4KvQrXC3Hme8RcP5ooRz-dD9DXCNTyTQs';

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                    setIsLoading(false);
                });
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Seu navegador não suporta notificações push.');
            return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        
        if (isSubscribed) {
            // Lógica para cancelar inscrição (opcional, mas boa prática)
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Opcional: Enviar para o backend para remover do DB
                // await api.post('/unsubscribe');
                setIsSubscribed(false);
                console.log('Inscrição cancelada.');
            }
        } else {
            // Lógica para se inscrever
            try {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
                
                await api.post('/subscribe', subscription);
                setIsSubscribed(true);
                console.log('Inscrito com sucesso!');

            } catch (error) {
                console.error('Falha ao se inscrever:', error);
            }
        }
    };
    
    if (isLoading) return null;

    return (
        <button 
            onClick={handleSubscription} 
            title={isSubscribed ? "Desativar notificações" : "Ativar notificações"}
            style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', position: 'absolute', top: '20px', right: '20px'}}
        >
            {isSubscribed ? <FaBellSlash size={22} /> : <FaBell size={22} />}
        </button>
    );
};

export default NotificationManager;