const overlay = document.getElementById('modalOverlay');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

// 1. Controle dos Modais
function openModal(type) {
    if (!overlay) return;
    overlay.style.display = 'flex';
    if (type === 'login') {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    } else {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    }
}

function closeModal() {
    if (overlay) overlay.style.display = 'none';
}

if (overlay) {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

// 2. Mostrar/Esconder Senha
function togglePass(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// 3. Validação de Senha (Match)
const passInput = document.getElementById('regPass');
const confirmInput = document.getElementById('regPassConfirm');
const matchMsg = document.getElementById('matchMessage');

function validate() {
    if (!confirmInput || !passInput) return false;
    
    if (!confirmInput.value) {
        matchMsg.textContent = "";
        return false;
    }
    if (passInput.value === confirmInput.value) {
        matchMsg.textContent = "As senhas coincidem";
        matchMsg.className = "val-msg success-text";
        confirmInput.style.borderColor = "var(--success)";
        return true;
    } else {
        matchMsg.textContent = "As senhas não coincidem";
        matchMsg.className = "val-msg error-text";
        confirmInput.style.borderColor = "var(--error)";
        return false;
    }
}

if (confirmInput && passInput) {
    confirmInput.addEventListener('input', validate);
    passInput.addEventListener('input', validate);
}

// 4. Sistema de Notificação (Toast Adaptável)
function showToast(message, type = 'error') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    // Adiciona a classe toast + o tipo (success ou error)
    toast.className = `toast ${type}`; 
    
    // Define o ícone com base no tipo
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove o balão após 4 segundos
    setTimeout(() => {
        toast.style.animation = "toast-out 0.5s ease-in forwards";
        setTimeout(() => toast.remove(), 500); 
    }, 4000);
}

// 5. Envio de Dados (Fetch POST) Corrigido
async function sendData(e, url) {
    e.preventDefault();
    const form = e.target;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include", 
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || "Erro na autenticação.");
        }

        // --- CASO DE SUCESSO ---
        closeModal();
        form.reset();
        showToast(result.message || "Operação realizada com sucesso!", "success");

        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 2000);

    } catch (error) {
        // --- CASO DE ERRO ---
        showToast(error.message, "error");
        if (matchMsg) matchMsg.textContent = "";
    }
}

// Gatilhos dos Formulários
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
    loginForm.onsubmit = (e) => sendData(e, '/auth/login');
}

if (registerForm) {
    registerForm.onsubmit = (e) => {
        if (!validate()) {
            e.preventDefault();
            showToast("As senhas não coincidem!", "error");
            return;
        }
        sendData(e, '/auth/register');
    };
}

// 6. Scroll Animation Observer
const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { 
        if (en.isIntersecting) en.target.classList.add('visible'); 
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-block').forEach(el => obs.observe(el));