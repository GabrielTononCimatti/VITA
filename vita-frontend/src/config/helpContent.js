// Usamos chaves que representam as partes principais das rotas
export const helpContent = {
    // --- ROTAS DE FUNCIONÁRIO ---
    "/employee/inicio": {
        title: "Ajuda - Início",
        content: `Esta é a sua página inicial. Aqui você encontra:\n\n
* **Cartões de Estatísticas:** Um resumo rápido dos seus projetos em andamento, atrasados e concluídos.\n
* **Projetos Recentes:** Uma lista dos últimos 5 projetos em que você trabalhou ou criou. Clique em um projeto para ver mais detalhes.\n
* **Ações (Botões):**\n
    * \`Ver Todos os Projetos\`: Leva para a página de pesquisa completa de projetos.\n
    * \`Ícone de sino em cada projeto\`: Abre a aba de notificações referente àquele projeto específico.\n
`,
    },
    "/employee/pesquisa": {
        title: "Ajuda - Pesquisa de Projetos",
        content: `Utilize esta página para encontrar seus projetos.\n\n
* **Barra de Pesquisa:** Digite o nome do projeto ou nome do cliente para filtrar a lista.\n
* **Filtros de Status:** Marque as caixas para ver apenas projetos com status específicos (Em andamento, Em atraso, Finalizado).\n
* **Tabela de Projetos:** Exibe os projetos encontrados. Clique em uma linha para ir para a página de detalhes do projeto.\n
* **Notificações de Projetos:** Exibe as notificações relacionadas aos projetos. Clique em uma notificação para ver mais detalhes.`,
    },
    "/employee/projeto": {
        title: "Ajuda - Detalhes do Projeto",
        content: `Esta página mostra informações detalhadas sobre um projeto específico.\n\n
* **Cabeçalho:** Contém o nome, ID do projeto e as datas de início e término (ou previsão).\n
* **Linha do Tempo de Etapas:** Mostra todas as etapas do projeto. A etapa atual está destacada em azul, e as concluídas em verde. Você pode clicar em uma etapa para ver sua descrição abaixo.\n
* **Informações Gerais:** Detalhes sobre cliente, responsável (você) e a descrição geral do projeto.\n
* **Detalhes da Etapa:** Mostra a descrição da etapa selecionada na linha do tempo. Se a etapa exigir documentos, um botão "Ver Documentos" aparecerá.\n
* **Ações (Botões):**\n
    * \`Avançar Etapa\`: Move o projeto para a próxima etapa na ordem definida. Só habilitado se a etapa *ativa* estiver selecionada.\n
    * \`Voltar Etapa\`: Retorna o projeto para a etapa anterior. Só habilitado se a etapa *ativa* estiver selecionada (ou se o projeto estiver "Finalizado" e a última etapa selecionada).\n
    * \`Editar Projeto\`: Leva para a tela de edição das informações gerais do projeto (nome, cliente, datas, descrição).\n
    * \`Editar Etapas\`: Leva para a tela onde você pode adicionar, remover, reordenar e modificar as etapas do projeto.`,
    },
    "/employee/novo-projeto": {
        title: "Ajuda - Novo Projeto",
        content: `Preencha os dados básicos para iniciar um novo projeto:\n\n
* **Nome do Projeto:** Um nome identificador para o projeto.\n
* **Cliente:** Selecione o cliente para o qual este projeto será realizado.\n
* **Data de Início:** Data em que o projeto se inicia.\n
* **Data de Término (Prevista):** Data estimada para a conclusão do projeto (opcional).\n
* **Descrição:** Detalhes sobre o escopo e objetivos do projeto.\n\n
Clique em "Avançar para Etapas" para definir as fases do projeto.`,
    },
    "/employee/novo-projeto/etapas": {
        title: "Ajuda - Definir Etapas (Novo Projeto)",
        content: `Defina as etapas que compõem este projeto.\n\n
* **Nova Etapa:** Preencha nome, descrição e se a etapa exige documentos. Clique em "Adicionar Etapa à Lista".\n
* **Editando Etapa:** Clique no ícone de lápis ao lado de uma etapa na lista para carregar seus dados no formulário e poder editá-los. Clique em "Salvar Alterações na Etapa" para confirmar.\n
* **Ordem das Etapas:** A lista à direita mostra as etapas atuais. Você pode arrastar e soltar os cards para reordená-las. A ordem aqui definida será a sequência do projeto.\n
* **Remover Etapa:** Clique no ícone de lixeira para remover uma etapa da lista.\n\n
Clique em "Criar Projeto" para salvar o projeto com estas etapas.`,
    },
    "/employee/projeto/:projectId/editar": {
        title: "Ajuda - Editar Projeto",
        content: `Modifique as informações gerais do projeto.\n\n
* **Nome, Cliente, Datas, Descrição:** Altere os campos conforme necessário.\n\n
Clique em "Salvar Alterações" para confirmar. Use "Cancelar" para voltar sem salvar.`,
    },
    "/employee/projeto/:projectId/editar-etapas": {
        title: "Ajuda - Editar Etapas (Projeto Existente)",
        content: `Gerencie as etapas de um projeto já existente.\n\n
* **Nova Etapa:** Funciona como na criação, adicionando uma nova etapa ao final da lista (você pode reordenar depois).\n
* **Editando Etapa:** Clique no ícone de lápis para editar nome, descrição ou exigência de documentos.\n
* **Ordem das Etapas:** Arraste e solte para redefinir a sequência.\n
* **Remover Etapa:** Clique na lixeira. Etapas já concluídas ou em andamento podem ter restrições.\n\n
Clique em "Salvar Alterações no Projeto" para aplicar as mudanças.`,
    },
    "/employee/perfil": {
        title: "Ajuda - Meu Perfil",
        content: `Gerencie seus dados pessoais e de acesso.\n\n
* **Informações Pessoais:** Visualize seus dados cadastrais (nome, telefone). Para alterar, modifique os campos desejados e clique em "Solicitar Alterações". Sua solicitação será enviada para aprovação de um administrador.\n
* **Informações da Conta:** Altere seu email de login ou defina uma nova senha. Por segurança, ao salvar alterações aqui, você será desconectado.`,
    },

    // --- ROTAS DE CLIENTE ---
    "/client/inicio": {
        title: "Ajuda - Início",
        content: `Bem-vindo à sua página inicial! Aqui você pode ver:\n\n
* **Cartões de Estatísticas:** Um resumo dos seus projetos em andamento, atrasados e finalizados.\n
* **Seus Projetos:** Uma lista dos seus projetos. Clique em um projeto para ver os detalhes e o progresso.`,
    },
    "/client/pesquisa": {
        title: "Ajuda - Pesquisa de Projetos",
        content: `Encontre seus projetos facilmente.\n\n
* **Barra de Pesquisa:** Digite o nome ou ID do projeto para filtrar.\n
* **Filtros de Status:** Selecione para ver apenas projetos com um status específico.\n
* **Tabela de Projetos:** Lista dos seus projetos. Clique para ver detalhes.\n
* **Notificações de Projetos:** Receba alertas sobre atualizações nos seus projetos. Clique no ícone de sino para ver mais.`,
    },
    "/client/projeto": {
        // Chave genérica para a página de detalhes do projeto do cliente
        title: "Ajuda - Detalhes do Projeto",
        content: `Acompanhe o andamento do seu projeto.\n\n
* **Cabeçalho:** Nome, ID e datas do projeto.\n
* **Linha do Tempo de Etapas:** Veja todas as etapas planejadas. A etapa atual está em azul, as concluídas em verde. Clique em uma etapa para ler sua descrição.\n
* **Informações Gerais:** Descrição do projeto e quem é o funcionário responsável.\n
* **Detalhes da Etapa:** Descrição da etapa selecionada. Se houver documentos associados, o botão "Ver Documentos" estará disponível.`,
    },
    "/client/projeto/:projectId/etapa/:etapaId/documentos": {
        // Chave genérica para página de documentos
        title: "Ajuda - Gerenciador de Documentos",
        content: `Visualize e adicione documentos ou links relevantes para esta etapa do projeto.\n\n
* **Documentos da Etapa:** Lista os arquivos e links já adicionados, mostrando quem enviou e quando. Use os ícones para visualizar (abrir link/arquivo) ou excluir.\n
* **Adicionar Novo Documento:**\n
    * Escolha entre 'Link' ou 'Arquivo'.\n
    * Dê um nome (opcional para links, obrigatório para arquivos se diferente do nome original).\n
    * Insira a URL (para links) ou selecione o arquivo do seu computador.\n
    * Clique em "Adicionar".`,
    },
    "/client/perfil": {
        title: "Ajuda - Meu Perfil",
        content: `Gerencie seus dados pessoais e de acesso.\n\n
* **Informações Pessoais:** Visualize seus dados cadastrais (nome/razão social, documento, telefone). Para alterar, modifique os campos desejados e clique em "Solicitar Alterações". Sua solicitação será enviada para aprovação de um administrador.\n
* **Informações da Conta:** Altere seu email de login ou defina uma nova senha. Por segurança, ao salvar alterações aqui, você será desconectado.`,
    },

    // --- ROTAS DE ADMIN ---
    "/admin/inicio": {
        title: "Ajuda - Início",
        content: `Visão geral do sistema.\n\n
* **Cartões de Estatísticas:** Resumo de todos os projetos (andamento, atraso, concluídos).\n
* **Projetos Recentes:** Lista dos últimos projetos criados ou atualizados no sistema. Clique para detalhes.\n
* **Botão "Ver Todos os Projetos":** Leva para a tela de pesquisa completa.`,
    },
    "/admin/pesquisa": {
        title: "Ajuda - Todos os Projetos",
        content: `Visualize e filtre todos os projetos do sistema.\n\n
* **Barra de Pesquisa:** Busque por nome do projeto, nome do cliente ou nome do funcionário.\n
* **Filtros de Status:** Refine a busca pelo status atual do projeto.\n
* **Tabela de Projetos:** Lista de todos os projetos. Clique para ver detalhes.`,
    },
    "/admin/pessoas": {
        title: "Ajuda - Gerenciamento de Pessoas",
        content: `Gerencie os usuários do sistema.\n\n
* **Abas (Clientes, Funcionários, Administradores):** Navegue entre os tipos de usuário.\n
* **Barra de Pesquisa:** Encontre pessoas por nome ou documento (CPF/CNPJ para clientes).\n
* **Tabela de Pessoas:** Lista os usuários da aba selecionada. Clique em uma linha para editar os dados da pessoa.\n
* **Botão "Nova Pessoa":** Inicia o processo de pré-cadastro de uma nova pessoa (cliente, funcionário ou admin).`,
    },
    "/admin/projeto": {
        // Chave genérica para a página de detalhes do projeto do admin
        title: "Ajuda - Detalhes do Projeto",
        content: `Visualize detalhes e gerencie um projeto.\n\n
* **Cabeçalho:** Nome, ID e datas do projeto.\n
* **Linha do Tempo de Etapas:** Mostra todas as etapas do projeto. A etapa atual está destacada em azul, e as concluídas em verde. Você pode clicar em uma etapa para ver sua descrição abaixo.\n
* **Informações Gerais:** Cliente, funcionário responsável e descrição.\n
* **Detalhes da Etapa:** Descrição da etapa selecionada e botão para documentos, se aplicável.\n
* **Ações (Botão):**\n
    * \`Excluir Projeto\`: Remove permanentemente o projeto do sistema (ação irreversível). Requer confirmação digitando o nome do projeto.`,
    },
    // Adicione mais rotas do admin aqui...
    "/admin/pessoas/novo": {
        title: "Ajuda - Nova Pessoa (Pré-cadastro)",
        content: `Inicie o cadastro de um novo usuário no sistema.\n\n
* **Tipo de Pessoa:** Selecione se será um Cliente (PF ou PJ), Funcionário ou Administrador.\n
* **Dados Pessoais:** Preencha as informações solicitadas (Nome, CPF/CNPJ, Telefone) conforme o tipo selecionado.\n\n
Ao clicar em "Criar e Gerar Link", um link único será gerado. Você deve copiar este link e enviá-lo para a pessoa, que o usará para definir seu próprio e-mail e senha, finalizando o cadastro.`,
    },
    "/admin/pessoas/editar": {
        title: "Ajuda - Editar Pessoa",
        content: `Modifique os dados cadastrais de uma pessoa existente.\n\n
* **Tipo de Pessoa:** Não pode ser alterado.\n
* **Dados Pessoais:** Edite nome, documento (CPF/CNPJ), telefone.\n\n
Clique em "Salvar Alterações" para confirmar.`,
    },
    // Rota de Perfil (Comum a todos)
    "/admin/perfil": {
        title: "Ajuda - Meu Perfil",
        content: `Gerencie seus dados pessoais e de acesso.\n\n
* **Informações Pessoais:** Visualize e edite diretamente seus dados cadastrais (nome, telefone). Clique em "Salvar Dados Pessoais" para aplicar as mudanças.\n
* **Informações da Conta:** Altere seu email de login ou defina uma nova senha. Por segurança, ao salvar alterações aqui, você será desconectado.`,
    },
    // Rota de Documentos (Comum a Funcionário e Cliente, talvez Admin?)
    "/documentos": {
        title: "Ajuda - Gerenciador de Documentos",
        content: `Visualize e adicione documentos ou links relevantes para esta etapa do projeto.\n\n
* **Documentos da Etapa:** Lista os arquivos e links já adicionados, mostrando quem enviou e quando. Use os ícones para visualizar (abrir link/arquivo) ou excluir (ícone de lixeira).\n
* **Adicionar Novo Documento:**\n
    * Escolha entre 'Link' ou 'Arquivo'.\n
    * Dê um nome (opcional para links, obrigatório para arquivos se diferente do nome original).\n
    * Insira a URL (para links) ou selecione o arquivo do seu computador.\n
    * Clique em "Adicionar".`,
    },
};
