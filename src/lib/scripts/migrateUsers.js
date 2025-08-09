// src/lib/scripts/migrateUsers.js
// ATENÇÃO: Este script deve ser executado com cuidado e apenas uma vez.
// Certifique-se de que suas credenciais de admin não estão expostas no frontend.

// Para rodar: node -r dotenv/config src/lib/scripts/migrateUsers.js

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
} catch (error) {
  if (!/already exists/u.test(error.message)) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

async function migrateUsers() {
  console.log('Iniciando migração de usuários...');

  try {
    const listUsersResult = await adminAuth.listUsers(1000); // Pega até 1000 usuários
    const batch = adminDb.batch();

    listUsersResult.users.forEach((userRecord) => {
      console.log(
        `- Preparando migração para: ${userRecord.email} (UID: ${userRecord.uid})`,
      );
      const userRef = adminDb.collection('users').doc(userRecord.uid);
      batch.set(
        userRef,
        {
          email: userRecord.email,
          plan: 'Pro',
          subscriptionStatus: 'active', // Status manual para usuários antigos
        },
        { merge: true },
      );
    });

    await batch.commit();
    console.log(
      `Migração concluída! ${listUsersResult.users.length} usuários atualizados para o plano Pro.`,
    );
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

migrateUsers();
