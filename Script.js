    // CONFIGURE A URL DO SEU APPS SCRIPT AQUI
        // IMPORTANTE: Para que as requisições `fetch` funcionem corretamente e retornem respostas do servidor,
        // você DEVE configurar o Google Apps Script para permitir requisições CORS do seu domínio.
        // Além disso, remova `mode: 'no-cors'` das requisições `fetch` para receber as respostas da API.
        const API_URL = 'COLE_A_URL_DO_SEU_APPS_SCRIPT_AQUI';

        let currentUser = null;
        let sales = [];
        let editingId = null;
        let dailyChart = null;
        let productChart = null;

        document.getElementById('saleDate').valueAsDate = new Date();

        function showRegister() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        }

        function showLogin() {
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        }

        async function register() {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const msgDiv = document.getElementById('registerMessage');
            const btn = document.getElementById('btnRegister');

            if (!name || !email || !password) {
                msgDiv.innerHTML = '<div class="error">Por favor, preencha todos os campos!</div>';
                return;
            }

            if (password.length < 6) {
                msgDiv.innerHTML = '<div class="error">A senha deve ter pelo menos 6 caracteres!</div>';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Cadastrando...';

            try {
                // Salvar usuário no localStorage para validação
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                
                // Verificar se email já existe
                if (users.find(u => u.email === email)) {
                    msgDiv.innerHTML = '<div class="error">Este email já está cadastrado!</div>';
                    btn.disabled = false;
                    btn.textContent = 'Criar Conta';
                    return;
                }

                users.push({ name, email, password });
                localStorage.setItem('registeredUsers', JSON.stringify(users));

                // Enviar para Google Sheets em background
                fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'register', name, email, password })
                }).catch(err => console.log('Erro ao registrar no servidor:', err));

                msgDiv.innerHTML = '<div class="success">Conta criada com sucesso! Faça login.</div>';
                setTimeout(() => {
                    showLogin();
                    msgDiv.innerHTML = '';
                }, 2000);

            } catch (error) {
                msgDiv.innerHTML = '<div class="error">Erro ao cadastrar. Tente novamente.</div>';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Criar Conta';
            }
        }

        async function login() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const msgDiv = document.getElementById('loginMessage');
            const btn = document.getElementById('btnLogin');

            if (!email || !password) {
                msgDiv.innerHTML = '<div class="error">Por favor, preencha todos os campos!</div>';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Entrando...';

            try {
                // Verificar se o usuário está registrado localmente
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const user = users.find(u => u.email === email && u.password === password);

                if (!user) {
                    msgDiv.innerHTML = '<div class="error">Email ou senha incorretos! Se não tem conta, crie uma.</div>';
                    btn.disabled = false;
                    btn.textContent = 'Entrar';
                    return;
                }

                // Login bem-sucedido
                currentUser = { name: user.name, email: user.email };
                localStorage.setItem('user', JSON.stringify(currentUser));

                // Tentar validar no servidor em background
                fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', email, password })
                }).catch(err => console.log('Erro ao validar no servidor:', err));

                msgDiv.innerHTML = '<div class="success">Login realizado com sucesso!</div>';
                
                setTimeout(() => {
                    showMainScreen();
                    msgDiv.innerHTML = '';
                }, 800);

            } catch (error) {
                msgDiv.innerHTML = '<div class="error">Erro ao fazer login. Tente novamente.</div>';
                btn.disabled = false;
                btn.textContent = 'Entrar';
            }
        }

        function showMainScreen() {
            // Validar se usuário está realmente logado
            if (!currentUser || !currentUser.email) {
                alert('Erro: Você precisa fazer login primeiro!');
                logout();
                return;
            }

            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('mainScreen').style.display = 'block';
            document.getElementById('userAvatar').textContent = currentUser.name[0].toUpperCase();
            loadSales();
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                currentUser = null;
                sales = [];
                localStorage.removeItem('user');
                document.getElementById('mainScreen').style.display = 'none';
                document.getElementById('authScreen').style.display = 'flex';
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                document.getElementById('loginMessage').innerHTML = '';
            }
        }

        function calculateTotal() {
            const quantity = parseFloat(document.getElementById('saleQuantity').value) || 0;
            const unitPrice = parseFloat(document.getElementById('saleUnitPrice').value) || 0;
            const total = quantity * unitPrice;
            document.getElementById('saleTotal').value = total.toFixed(2);
        }

        async function addSale() {
            const date = document.getElementById('saleDate').value;
            const product = document.getElementById('saleProduct').value;
            const quantity = parseFloat(document.getElementById('saleQuantity').value);
            const unitPrice = parseFloat(document.getElementById('saleUnitPrice').value);
            const total = parseFloat(document.getElementById('saleTotal').value);
            const btn = document.getElementById('btnAddSale');

            if (!date || !product || !quantity || !unitPrice) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Salvando...';

            const sale = { 
                id: editingId || Date.now(),
                email: currentUser.email, 
                date, 
                product, 
                quantity, 
                unitPrice, 
                total 
            };

            try {
                // Adicionar ou atualizar localmente primeiro
                if (editingId) {
                    const index = sales.findIndex(s => s.id === editingId);
                    if (index !== -1) {
                        sales[index] = sale;
                    }
                    
                    // Enviar para o Apps Script
                    fetch(API_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'updateSale', ...sale })
                    }).catch(err => console.log('Erro ao atualizar no servidor:', err));
                    
                    editingId = null;
                    document.getElementById('btnAddText').textContent = '➕ Adicionar Venda';
                } else {
                    // Adicionar localmente
                    sales.push(sale);
                    
                    // Enviar para o Apps Script em background
                    fetch(API_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'saveSale', ...sale })
                    }).catch(err => console.log('Erro ao salvar no servidor:', err));
                }

                // Salvar no localStorage como backup
                localStorage.setItem(`sales_${currentUser.email}`, JSON.stringify(sales));

                clearForm();
                displaySales();

            } catch (error) {
                alert('Erro ao salvar venda. Tente novamente.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span id="btnAddText">➕ Adicionar Venda</span>';
            }
        }

        function clearForm() {
            document.getElementById('businessName').value = '';
            document.getElementById('saleDate').valueAsDate = new Date();
            document.getElementById('saleProduct').value = '';
            document.getElementById('saleQuantity').value = '1';
            document.getElementById('saleUnitPrice').value = '';
            document.getElementById('saleTotal').value = '';
        }

        async function loadSales() {
            try {
                // Tentar carregar do localStorage primeiro (funciona offline)
                const savedSales = localStorage.getItem(`sales_${currentUser.email}`);
                if (savedSales) {
                    sales = JSON.parse(savedSales);
                    displaySales();
                }

                // Tentar carregar do servidor em background
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getSales', email: currentUser.email })
                });

                const data = await response.json();
                if (data.success && data.sales) {
                    sales = data.sales;
                    localStorage.setItem(`sales_${currentUser.email}`, JSON.stringify(sales));
                    displaySales();
                }
            } catch (error) {
                console.log('Usando dados locais:', error);
                // Se falhar, usa os dados do localStorage que já foram carregados
                displaySales();
            }
        }

        function displaySales() {
            const container = document.getElementById('salesContainer');
            
            if (sales.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 60px;">📊</div>
                        <h3>Nenhuma venda registrada ainda</h3>
                        <p>Adicione sua primeira venda usando o formulário acima</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = sales.map(sale => `
                <div class="sale-card">
                    <div class="sale-header">
                        <div class="sale-date">📅 ${formatDate(sale.date)}</div>
                        <div class="sale-actions">
                            <button class="btn-small btn-edit" onclick="editSale(${sale.id})">✏️ Editar</button>
                            <button class="btn-small btn-delete" onclick="deleteSale(${sale.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                    <div class="sale-details">
                        <div class="sale-detail">
                            <div class="sale-detail-label">Empreendimento</div>
                            <div class="sale-detail-value">${sale.businessName || 'N/A'}</div>
                        </div>
                        <div class="sale-detail">
                            <div class="sale-detail-label">Produto/Serviço</div>
                            <div class="sale-detail-value">${sale.product}</div>
                        </div>
                        <div class="sale-detail">
                            <div class="sale-detail-label">Quantidade</div>
                            <div class="sale-detail-value">${sale.quantity}</div>
                        </div>
                        <div class="sale-detail">
                            <div class="sale-detail-label">Valor Unitário</div>
                            <div class="sale-detail-value">R$ ${sale.unitPrice.toFixed(2)}</div>
                        </div>
                        <div class="sale-detail">
                            <div class="sale-detail-label">Total</div>
                            <div class="sale-detail-value total-value">R$ ${sale.total.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function editSale(id) {
            const sale = sales.find(s => s.id === id);
            if (!sale) return;

            document.getElementById('businessName').value = sale.businessName || '';
            document.getElementById('saleDate').value = sale.date;
            document.getElementById('saleProduct').value = sale.product;
            document.getElementById('saleQuantity').value = sale.quantity;
            document.getElementById('saleUnitPrice').value = sale.unitPrice;
            document.getElementById('saleTotal').value = sale.total.toFixed(2);
            
            editingId = id;
            document.getElementById('btnAddText').textContent = '💾 Salvar Alterações';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        async function deleteSale(id) {
            if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

            try {
                // Remover localmente
                sales = sales.filter(s => s.id !== id);
                localStorage.setItem(`sales_${currentUser.email}`, JSON.stringify(sales));
                displaySales();

                // Enviar para o servidor em background
                fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'deleteSale', id })
                }).catch(err => console.log('Erro ao deletar no servidor:', err));

            } catch (error) {
                alert('Erro ao excluir venda. Tente novamente.');
            }
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }

        async function submitReport() {
            if (sales.length === 0) {
                alert('Adicione pelo menos uma venda antes de enviar o relatório!');
                return;
            }

            const btn = document.getElementById('btnSubmitReport');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Enviando relatório...';

            const totalSales = sales.length;
            const totalValue = sales.reduce((sum, sale) => sum + sale.total, 0);

            try {
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'submitReport', 
                        email: currentUser.email,
                        totalSales,
                        totalValue 
                    })
                });

                alert(`✅ Relatório enviado com sucesso!\n\nTotal de vendas: ${totalSales}\nValor total: R$ ${totalValue.toFixed(2)}\n\nOs dados foram salvos no Google Sheets.`);

            } catch (error) {
                alert('Erro ao enviar relatório. Tente novamente.');
            } finally {
                btn.disabled = false;
                btn.textContent = '📤 Enviar Relatório de Vendas';
            }
        }

        // Verificar se há usuário logado ao carregar a página
        window.onload = function() {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    currentUser = JSON.parse(savedUser);
                    
                    // Verificar se o usuário está registrado
                    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                    const userExists = users.find(u => u.email === currentUser.email);
                    
                    if (!userExists) {
                        // Usuário não está registrado, fazer logout
                        localStorage.removeItem('user');
                        currentUser = null;
                        alert('Sessão inválida. Por favor, faça login novamente.');
                        return;
                    }
                    
                    // Carregar vendas do localStorage primeiro
                    const savedSales = localStorage.getItem(`sales_${currentUser.email}`);
                    if (savedSales) {
                        sales = JSON.parse(savedSales);
                    }
                    
                    showMainScreen();
                } catch (error) {
                    localStorage.removeItem('user');
                    currentUser = null;
                }
            }
        };