// Importe as funções que você precisa dos SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// TODO: Adicione a configuração do seu projeto Firebase aqui
const firebaseConfig = {
  apiKey: 'AIzaSyAm3ZoPcUsehkCuk1I5eU9KZyTSMtbt8Ks',
  authDomain: 'venda-de-farinhas.firebaseapp.com',
  projectId: 'venda-de-farinhas',
  storageBucket: 'venda-de-farinhas.firebasestorage.app',
  messagingSenderId: '1065436179125',
  appId: '1:1065436179125:web:2dd3a3155c0313afcf2cfc',
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Firestore para que outros arquivos possam usá-la
export const db = getFirestore(app);
export const auth = getAuth(app); // Exporta o serviço de autenticação
