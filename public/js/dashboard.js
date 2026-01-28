/**
 * FINANCIAL.CONTROL - Dashboard Core Logic
 * Focado em UX Fluida, Injeção de DOM e Avatar Dinâmico
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia o Avatar com a inicial do usuário
    generateAvatar();
    
    // 2. Animação de entrada dos blocos (Efeito Cascade)
    const animatedBlocks = document.querySelectorAll('.animate-block');
    animatedBlocks.forEach((block, index) => {
        setTimeout(() => {
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

/* --- PERFIL E AVATAR --- */
function generateAvatar() {
    // Pega o nome do usuário que está no HTML (EJS)
    const userNameElement = document.querySelector('.user-welcome strong');
    const avatarContainer = document.getElementById('userAvatar');
    
    if (userNameElement && avatarContainer) {
        const name = userNameElement.innerText.trim();
        const initial = name.charAt(0).toUpperCase();
        avatarContainer.innerText = initial;
    }
}

/* --- SISTEMA DE NOTIFICAÇÕES (TOASTS) --- */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const icons = {
        success: '<i class="fa-solid fa-circle-check"></i>',
        error: '<i class="fa-solid fa-triangle-exclamation"></i>'
    };
    
    toast.className = `toast toast-${type}`;
    // Cores baseadas no status
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    
    toast.innerHTML = `
        ${icons[type] || icons.success}
        <span style="margin-left: 10px;">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove após 3.5 segundos com animação de saída
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.5s ease-in forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
}

/* --- GERENCIADOR DE MODAIS --- */
function openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    overlay.style.display = 'flex';
    setTimeout(() => {
        const card = overlay.querySelector('.modal-card');
        if (card) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    }, 10);
}

function closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    const card = overlay.querySelector('.modal-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    }

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// Funções de atalho para o HTML
function openCreateModal() { openModal('createColOverlay'); }
function closeCreateModal() { closeModal('createColOverlay'); }
function openSettings() { openModal('settingsOverlay'); }
function closeSettings() { closeModal('settingsOverlay'); }

// Fechar modais ao clicar fora ou ESC
window.onclick = (e) => { if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id); };
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => closeModal(m.id));
    }
});

/* --- ADICIONAR COLEÇÃO (UX SEM REFRESH) --- */const createForm = document.getElementById('createColForm');
if (createForm) {
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = createForm.querySelector('.btn-submit');
        const input = document.getElementById('newColName');
        const colName = input.value.trim();
        const originalHTML = btn.innerHTML;

        if (!colName) return showToast('O nome não pode estar vazio', 'error');
        
        const regex = /^[a-zA-Z0-9]+$/;
        if (!regex.test(colName)) {
            return showToast('Use apenas letras e números (sem espaços)', 'error');
            closeCreateModal();
        }
        if(colName == "metadados"){
            return showToast('Nome invalido!', 'error');
            closeCreateModal();
        }
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Criando...';
        btn.disabled = true;

        try {
            const response = await fetch(`/docs/post/collection/${encodeURIComponent(colName)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                showToast('Coleção criada com sucesso!', 'success');
                injectNewCard(colName);
                closeCreateModal();
                input.value = '';
            } else {
                showToast(data.message || 'Erro ao criar coleção', 'error');
            }
        } catch (err) {
            showToast('Erro de conexão com o servidor', 'error');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    });
}


function injectNewCard(name) {
    const grid = document.querySelector('.collections-grid');
    const emptyState = document.querySelector('.empty-state');
    
    // Remove o aviso de "vazio" se for a primeira coleção
    if (emptyState) emptyState.remove();

    const cardHtml = `
        <div class="col-card new-card-anim" id="card-${name}">
            <div class="col-icon">
                <i class="fa-solid fa-database"></i>
            </div>
            <div class="col-info">
                <h3>${name}</h3>
                <p>0 registros</p>
            </div>
            <div class="col-actions">
                <a href="docs/get/collection/${encodeURIComponent(name)}" class="btn-view">Ver</a>
                <button class="btn-delete" onclick="deleteCollection('${name}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `;
    
    // Adiciona no início da grade com animação suave
    grid.insertAdjacentHTML('afterbegin', cardHtml);
}

/* --- DELETAR COLEÇÃO (UX SUAVE) --- *//* --- DELETAR COLEÇÃO (UX TOTALMENTE SUAVE) --- */
let collectionToDelete = null; // Variável global temporária

/* --- NOVA LÓGICA DE DELETAR COM MODAL --- */
async function deleteCollection(colName) {
    collectionToDelete = colName; // Salva o nome para usar no clique do botão do modal
    
    const displayElement = document.getElementById('deleteColNameDisplay');
    if(displayElement) displayElement.innerText = colName;

    openModal('deleteConfirmOverlay');

    // Configura o botão de confirmação dentro do modal
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = async () => {
        closeModal('deleteConfirmOverlay');
        await executeDelete(collectionToDelete);
    };
}

/* --- EXECUÇÃO REAL DA EXCLUSÃO --- */
async function executeDelete(colName) {
    const card = document.getElementById(`card-${colName}`);
    if (!card) return;

    // Feedback visual no card
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';

    try {
        const response = await fetch(`/docs/delete/collection/${encodeURIComponent(colName)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'scale(0.8) translateY(-20px)';
            card.style.opacity = '0';

            setTimeout(() => {
                card.remove();
                const grid = document.querySelector('.collections-grid');
                if (grid && grid.querySelectorAll('.col-card').length === 0) {
                    injectEmptyState(grid);
                }
            }, 500);

            showToast(`Coleção "${colName}" removida.`);
        } else {
            throw new Error();
        }
    } catch (err) {
        card.style.opacity = '1';
        card.style.pointerEvents = 'all';
        showToast('Erro ao remover coleção', 'error');
    }
}

// Função auxiliar para manter a suavidade quando tudo for deletado
function injectEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state animate-block" style="opacity: 1; transform: translateY(0);">
            <i class="fa-solid fa-folder-open"></i>
            <p>Nenhuma coleção encontrada.</p>
        </div>
    `;
}
/* --- SISTEMA DE RENOMEAR COLEÇÃO --- */
let collectionToRename = null;

function openRenameModal(oldName) {
    collectionToRename = oldName;
    const display = document.getElementById('oldColNameDisplay');
    const input = document.getElementById('editColNameInput');
    
    if (display) display.innerText = oldName;
    if (input) input.value = oldName; // Preenche com o nome atual
    
    openModal('renameColOverlay');
}

const renameForm = document.getElementById('renameColForm');
if (renameForm) {
    renameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = document.getElementById('editColNameInput').value.trim();
        const btn = renameForm.querySelector('.btn-submit');
        const originalHTML = btn.innerHTML;

        // Validações básicas (mesmas do Create)
        if (!newName || newName === collectionToRename) return closeModal('renameColOverlay');
        const regex = /^[a-zA-Z0-9]+$/;
        if (!regex.test(newName)) return showToast('Use apenas letras e números', 'error');

        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';
        btn.disabled = true;

        try {
            const response = await fetch(`/docs/patch/collection/${encodeURIComponent(collectionToRename)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ NovoNome: newName }) // Enviando como solicitado
            });

            const data = await response.json();

            if (data.success) {
                showToast('Coleção renomeada!', 'success');
                // Em vez de dar refresh, atualizamos a UI dinamicamente
                updateCardUI(collectionToRename, newName);
                closeModal('renameColOverlay');
            } else {
                showToast(data.message || 'Erro ao renomear', 'error');
            }
        } catch (err) {
            showToast('Erro de conexão', 'error');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    });
}

// Função para atualizar o card na tela sem refresh
function updateCardUI(oldName, newName) {
    const card = document.getElementById(`card-${oldName}`);
    if (card) {
        // Atualiza o ID do card para futuras operações
        card.id = `card-${newName}`;
        
        // Atualiza o título H3
        const title = card.querySelector('h3');
        if (title) title.innerText = newName;

        // Atualiza os botões (onclick e href)
        const btnView = card.querySelector('.btn-view');
        if (btnView) btnView.href = `docs/get/collection/${encodeURIComponent(newName)}`;

        const btnEdit = card.querySelector('.btn-edit');
        if (btnEdit) btnEdit.setAttribute('onclick', `openRenameModal('${newName}')`);

        const btnDel = card.querySelector('.btn-delete');
        if (btnDel) btnDel.setAttribute('onclick', `deleteCollection('${newName}')`);
    }
}