// login.js (NOVO ARQUIVO)
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

const formLogin = document.getElementById('formLogin');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const mensagemErro = document.getElementById('mensagemErro');

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value;
  const senha = senhaInput.value;
  mensagemErro.style.display = 'none'; // Esconde mensagens de erro antigas

  try {
    // Tenta fazer o login com a função do Firebase
    await signInWithEmailAndPassword(auth, email, senha);
    // Se o login for bem-sucedido, redireciona para a página principal
    window.location.href = 'index.html'; // Use 'index.html' se esse for o nome da sua página principal
  } catch (error) {
    // Se der erro, mostra uma mensagem amigável
    console.error('Erro no login:', error.code);
    mensagemErro.textContent = 'E-mail ou senha inválidos. Tente novamente.';
    mensagemErro.style.display = 'block';
  }
});
