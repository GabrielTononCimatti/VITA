import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { FaUserCircle, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useLocation, matchPath } from "react-router-dom";
import HelpModal from "./HelpModal"; // Importe o modal
import { helpContent } from "../../config/helpContent";

const TopbarWrapper = styled.div`
    height: 60px;
    background-color: ${({ theme }) => theme.colors.white};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 999;
`;

const ProfileName = styled.span`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;

const ProfileLink = styled(NavLink)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 10px;
    padding: 8px;
    border-radius: 4px;

    &.active {
        background-color: #f0f0f0;
    }
`;

const Topbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation(); // Hook para pegar a localização atual
    const [isHelpOpen, setIsHelpOpen] = useState(false); // Estado para o modal
    const [currentHelp, setCurrentHelp] = useState({ title: "", content: "" }); // Estado para o conteúdo

    // Função para encontrar a chave de ajuda correta
    // const getHelpKey = useCallback(() => {
    //     const pathname = location.pathname;

    //     // Tenta encontrar uma correspondência exata primeiro
    //     if (helpContent[pathname]) {
    //         return pathname;
    //     }

    //     // Lógica para rotas com parâmetros (simplificada)
    //     // Ajuste os padrões conforme necessário para suas rotas
    //     const pathSegments = pathname.split("/").filter(Boolean); // Remove barras extras e vazios

    //     if (pathSegments.length >= 2) {
    //         // Ex: /employee/projeto/:id -> /employee/projeto
    //         if (
    //             pathSegments[1] === "projeto" &&
    //             pathSegments.length > 2 &&
    //             !isNaN(parseInt(pathSegments[2]))
    //         ) {
    //             // Verifica se o terceiro segmento é um ID numérico (ajuste se for string)
    //             const key = `/${pathSegments[0]}/${pathSegments[1]}`;
    //             if (helpContent[key]) return key;
    //         }
    //         // Ex: /employee/projeto/:id/editar -> /employee/projeto/:projectId/editar
    //         if (pathSegments[1] === "projeto" && pathSegments[3] === "editar") {
    //             const key = `/${pathSegments[0]}/projeto/:projectId/editar`;
    //             if (helpContent[key]) return key;
    //         }
    //         // Ex: /employee/projeto/:id/editar-etapas -> /employee/projeto/:projectId/editar-etapas
    //         if (
    //             pathSegments[1] === "projeto" &&
    //             pathSegments[3] === "editar-etapas"
    //         ) {
    //             const key = `/${pathSegments[0]}/projeto/:projectId/editar-etapas`;
    //             if (helpContent[key]) return key;
    //         }
    //         // Ex: /admin/pessoas/editar/:userId -> /admin/pessoas/editar
    //         if (
    //             pathSegments[0] === "admin" &&
    //             pathSegments[1] === "pessoas" &&
    //             pathSegments[2] === "editar"
    //         ) {
    //             const key = `/${pathSegments[0]}/pessoas/editar`;
    //             if (helpContent[key]) return key;
    //         }
    //         // Ex: /employee/projeto/:projectId/etapa/:etapaId/documentos -> /documentos (genérico)
    //         if (
    //             pathSegments[1] === "projeto" &&
    //             pathSegments[3] === "etapa" &&
    //             pathSegments[5] === "documentos"
    //         ) {
    //             if (helpContent["/documentos"]) return "/documentos";
    //         }
    //     }
    //     // Rota de perfil genérica
    //     if (pathname.endsWith("/perfil")) {
    //         if (helpContent["/perfil"]) return "/perfil";
    //     }

    //     // Fallback se nenhuma chave específica for encontrada
    //     return null;
    // }, [location.pathname]);

    // Função para encontrar a chave de ajuda correta usando matchPath
    // const getHelpKey = useCallback(() => {
    //     const pathname = location.pathname;

    //     // Lista de padrões a serem testados (as chaves do seu helpContent)
    //     // Damos prioridade às rotas mais específicas primeiro
    //     const patterns = [
    //         // Rotas com parâmetros mais específicos primeiro
    //         "/employee/projeto/:projectId/editar-etapas",
    //         "/employee/projeto/:projectId/editar",
    //         "/employee/projeto/:projectId/etapa/:etapaId/documentos", // Documentos de Employee
    //         "/admin/pessoas/editar/:userId", // Editar pessoa Admin
    //         "/admin/projeto/:projectId", // Projeto Admin (mesma chave genérica)
    //         "/client/projeto/:projectId/etapa/:etapaId/documentos", // Documentos de Cliente
    //         "/client/projeto/:projectId", // Projeto Cliente (mesma chave genérica)
    //         "/employee/projeto/:projectId", // Projeto Employee (mesma chave genérica)

    //         // Rotas exatas depois
    //         "/employee/inicio",
    //         "/employee/pesquisa",
    //         "/employee/novo-projeto",
    //         "/employee/novo-projeto/etapas",
    //         "/client/inicio",
    //         "/client/pesquisa",
    //         "/admin/inicio",
    //         "/admin/pesquisa",
    //         "/admin/pessoas",
    //         "/admin/pessoas/novo",
    //         // Rotas genéricas que podem ser compartilhadas
    //         "/perfil", // Rota de perfil (pode precisar ajustar a chave no helpContent se for diferente por role)
    //     ];

    //     // Adiciona as chaves que realmente existem no helpContent para verificar
    //     const validPatterns = patterns.filter((p) => helpContent[p]);

    //     for (const pattern of validPatterns) {
    //         // Verifica se o padrão corresponde ao pathname atual
    //         const match = matchPath(
    //             { path: pattern, end: true }, // 'end: true' garante correspondência exata do padrão
    //             pathname
    //         );

    //         if (match) {
    //             // Lógica especial para rotas genéricas como /documentos ou /perfil se necessário
    //             if (
    //                 pattern ===
    //                     "/employee/projeto/:projectId/etapa/:etapaId/documentos" ||
    //                 pattern ===
    //                     "/client/projeto/:projectId/etapa/:etapaId/documentos"
    //             ) {
    //                 if (helpContent["/documentos"]) return "/documentos"; // Retorna a chave genérica
    //             }
    //             if (pathname.endsWith("/perfil")) {
    //                 if (helpContent["/perfil"]) return "/perfil"; // Retorna a chave genérica
    //             }
    //             // Para as rotas de projeto, usamos a chave genérica '/admin/projeto', '/client/projeto' ou '/employee/projeto'
    //             if (
    //                 pattern.includes("/:projectId") &&
    //                 !pattern.includes("/etapa/") &&
    //                 !pattern.includes("/editar")
    //             ) {
    //                 const role = pathSegments[0]; // admin, client ou employee
    //                 const genericProjectKey = `/${role}/projeto`;
    //                 if (helpContent[genericProjectKey])
    //                     return genericProjectKey;
    //             }

    //             // Retorna a chave exata que deu match (ex: '/employee/projeto/:projectId/editar')
    //             return pattern;
    //         }
    //     }

    //     // Se nenhuma correspondência for encontrada após iterar
    //     const pathSegments = pathname.split("/").filter(Boolean);
    //     // Se for uma página de projeto genérica (ex: /employee/projeto/ID), tenta a chave genérica
    //     if (pathSegments.length === 3 && pathSegments[1] === "projeto") {
    //         const genericKey = `/${pathSegments[0]}/projeto`;
    //         if (helpContent[genericKey]) return genericKey;
    //     }

    //     return null; // Nenhuma chave correspondente encontrada
    // }, [location.pathname]);

    // const getHelpKey = useCallback(() => {
    //     const pathname = location.pathname;

    //     // Lista de padrões a serem testados (as chaves do seu helpContent)
    //     // Damos prioridade às rotas mais específicas primeiro
    //     const patterns = [
    //         // Rotas com parâmetros mais específicos primeiro
    //         "/employee/projeto/:projectId/editar-etapas",
    //         "/employee/projeto/:projectId/editar",
    //         "/employee/projeto/:projectId/etapa/:etapaId/documentos", // Documentos de Employee
    //         "/admin/projeto/:projectId/etapa/:etapaId/documentos",
    //         "/admin/pessoas/editar/:userId", // Editar pessoa Admin
    //         "/client/projeto/:projectId/etapa/:etapaId/documentos", // Documentos de Cliente
    //         // Adicione os caminhos exatos do perfil aqui
    //         "/admin/perfil",
    //         "/employee/perfil",
    //         "/client/perfil",
    //         // Rotas genéricas de projeto (se aplicável) - verificadas depois das específicas
    //         "/admin/projeto/:projectId",
    //         "/client/projeto/:projectId",
    //         "/employee/projeto/:projectId",

    //         // Rotas exatas depois
    //         "/employee/inicio",
    //         "/employee/pesquisa",
    //         "/employee/novo-projeto",
    //         "/employee/novo-projeto/etapas",
    //         "/client/inicio",
    //         "/client/pesquisa",
    //         "/admin/inicio",
    //         "/admin/pesquisa",
    //         "/admin/pessoas",
    //         "/admin/pessoas/novo",
    //         // Rotas genéricas como '/documentos' se ainda precisar
    //         // '/documentos', // Removido ou ajustado conforme necessidade
    //     ];

    //     // Adiciona as chaves que realmente existem no helpContent para verificar
    //     const validPatterns = patterns.filter((p) => helpContent[p]);

    //     for (const pattern of validPatterns) {
    //         // Verifica se o padrão corresponde ao pathname atual
    //         const match = matchPath(
    //             { path: pattern, end: true }, // 'end: true' garante correspondência exata
    //             pathname
    //         );
    //         console.log("---COMEÇOU---"); // Log para depuração
    //         console.log("Current pathname:", pathname); // Log para depuração
    //         console.log(`Checking pattern: ${pattern}, match:`, match); // Log para depuração

    //         if (match) {
    //             // Lógica especial para rotas genéricas como /documentos (SE AINDA FOR NECESSÁRIO)
    //             if (
    //                 // pattern ===
    //                 //     "/employee/projeto/:projectId/etapa/:etapaId/documentos" ||
    //                 // pattern ===
    //                 //     "/client/projeto/:projectId/etapa/:etapaId/documentos" ||
    //                 // pattern ===
    //                 //     "/admin/projeto/:projectId/etapa/:etapaId/documentos"
    //                 pattern.endsWith("/documentos")
    //             ) {
    //                 // Se você decidiu ter UMA chave genérica '/documentos' no helpContent.js:
    //                 if (helpContent["/documentos"]) return "/documentos";
    //                 // Se decidiu ter chaves específicas por role (ex: '/employee/documentos'):
    //                 // const role = pathname.split('/')[1]; // employee ou client
    //                 // const docKey = `/${role}/documentos`;
    //                 // if (helpContent[docKey]) return docKey;
    //             }

    //             // Para as rotas de projeto, usamos a chave genérica '/admin/projeto', '/client/projeto' ou '/employee/projeto'
    //             if (
    //                 pattern.includes("/:projectId") &&
    //                 !pattern.includes("/etapa/") &&
    //                 !pattern.includes("/editar")
    //             ) {
    //                 const pathSegments = pathname.split("/").filter(Boolean);
    //                 const role = pathSegments[0]; // admin, client ou employee
    //                 const genericProjectKey = `/${role}/projeto`;
    //                 if (helpContent[genericProjectKey])
    //                     return genericProjectKey;
    //             }

    //             // REMOVIDO O BLOCO IF QUE TRATAVA '/perfil' GENERICAMENTE

    //             // Retorna a chave exata que deu match (ex: '/admin/perfil', '/employee/projeto/:projectId/editar')
    //             return pattern;
    //         }
    //     }

    //     // Fallback se nenhuma correspondência for encontrada após iterar
    //     const pathSegments = pathname.split("/").filter(Boolean);
    //     // Se for uma página de projeto genérica (ex: /employee/projeto/ID), tenta a chave genérica
    //     if (pathSegments.length === 3 && pathSegments[1] === "projeto") {
    //         const genericKey = `/${pathSegments[0]}/projeto`;
    //         if (helpContent[genericKey]) return genericKey;
    //     }

    //     return null; // Nenhuma chave correspondente encontrada
    // }, [location.pathname]);

    // Função para encontrar a chave de ajuda correta usando matchPath
    const getHelpKey = useCallback(() => {
        const pathname = location.pathname;

        // Lista de TODOS os padrões de rota que queremos reconhecer
        const patterns = [
            // 1. Rotas mais específicas primeiro (com mais segmentos)
            "/admin/projeto/:projectId/etapa/:etapaId/documentos",
            "/employee/projeto/:projectId/etapa/:etapaId/documentos",
            "/client/projeto/:projectId/etapa/:etapaId/documentos",
            "/employee/projeto/:projectId/editar-etapas",
            "/employee/projeto/:projectId/editar",
            "/admin/pessoas/editar/:userId",

            // 2. Rotas de detalhe de projeto (genéricas por ID)
            "/admin/projeto/:projectId",
            "/client/projeto/:projectId",
            "/employee/projeto/:projectId",

            // 3. Rotas exatas e de Perfil (específicas por role)
            "/admin/perfil",
            "/employee/perfil",
            "/client/perfil",
            "/employee/inicio",
            "/employee/pesquisa",
            "/employee/novo-projeto",
            "/employee/novo-projeto/etapas",
            "/client/inicio",
            "/client/pesquisa",
            "/admin/inicio",
            "/admin/pesquisa",
            "/admin/pessoas",
            "/admin/pessoas/novo",
        ];

        for (const pattern of patterns) {
            // Tenta dar match no padrão com a URL atual
            const match = matchPath({ path: pattern, end: true }, pathname);

            if (match) {
                // Se deu match, agora decidimos qual chave de conteúdo retornar

                // CASO 1: É uma rota de documentos
                if (
                    pattern.includes("/etapa/") &&
                    pattern.endsWith("/documentos")
                ) {
                    // Mapeia para a chave genérica '/documentos'
                    if (helpContent["/documentos"]) {
                        return "/documentos";
                    }
                }

                // CASO 2: É uma rota de detalhe de projeto (sem /editar ou /etapa)
                if (
                    pattern.includes("/:projectId") &&
                    !pattern.includes("/etapa/") &&
                    !pattern.includes("/editar")
                ) {
                    // Mapeia para a chave genérica por role (ex: '/admin/projeto')
                    const role = pathname.split("/")[1]; // Pega admin, client ou employee
                    const genericProjectKey = `/${role}/projeto`;
                    if (helpContent[genericProjectKey]) {
                        return genericProjectKey;
                    }
                }

                // CASO 3: É uma rota exata ou específica (ex: '/admin/perfil', '/employee/projeto/:projectId/editar')
                // Verifica se o próprio padrão (pattern) existe como chave no helpContent
                if (helpContent[pattern]) {
                    return pattern;
                }

                // Se encontrou um match mas nenhuma chave de conteúdo foi encontrada,
                // paramos aqui para não cair no fallback (ex: /admin/projeto/123 deu match, mas /admin/projeto não existe)
                break;
            }
        }

        // FALLBACK: Se o loop terminar sem NENHUM matchPath
        // Tenta a chave genérica de projeto (caso a URL seja /admin/projeto/ID e o padrão :projectId não tenha sido encontrado)
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length === 3 && pathSegments[1] === "projeto") {
            const genericKey = `/${pathSegments[0]}/projeto`;
            if (helpContent[genericKey]) return genericKey;
        }

        return null; // Nenhuma chave correspondente encontrada
    }, [location.pathname, helpContent]); // Adicionado helpContent às dependências

    // Atualiza o conteúdo da ajuda quando a rota muda
    useEffect(() => {
        const key = getHelpKey();
        console.log("Help key determined:", key); // Log para depuração
        if (key && helpContent[key]) {
            setCurrentHelp(helpContent[key]);
        } else {
            // Define um conteúdo padrão ou vazio se não encontrar
            setCurrentHelp({
                title: "Ajuda",
                content: "Conteúdo de ajuda não encontrado para esta página.",
            });
        }
    }, [getHelpKey]); // Recalcula quando a função getHelpKey (e consequentemente location.pathname) muda

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F1") {
                event.preventDefault(); // Impede a ajuda padrão do navegador
                setIsHelpOpen(true);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Limpa o listener quando o componente desmonta
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []); // Array vazio significa que roda apenas na montagem e desmontagem

    const profilePath = `/${user?.role}/perfil`;

    return (
        <>
            {" "}
            {/* Fragmento para envolver Topbar e Modal */}
            <TopbarWrapper>
                {/* Botão de Ajuda adicionado à esquerda dos dados do perfil */}
                <HelpButton onClick={() => setIsHelpOpen(true)}>
                    <FaQuestionCircle size={22} />
                </HelpButton>

                <ProfileMenu>
                    <FaUserCircle size={24} color="#800020" />
                    <ProfileName>
                        {user?.name ||
                            user?.razaoSocial ||
                            user?.tradeName ||
                            "Usuário"}
                    </ProfileName>

                    {user &&
                        profilePath && ( // Verifica se user e profilePath existem
                            <ProfileLink to={profilePath}>
                                Meu Perfil
                            </ProfileLink>
                        )}

                    <LogoutButton onClick={logout}>
                        <FaSignOutAlt style={{ marginRight: "5px" }} /> Sair
                    </LogoutButton>
                </ProfileMenu>
            </TopbarWrapper>
            {/* Renderiza o Modal */}
            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                title={currentHelp.title}
                content={currentHelp.content}
            />
        </>
    );
};

// Adicione os estilos para o botão de ajuda e ajuste o ProfileMenu se necessário
const HelpButton = styled.button`
    margin-right: auto; /* Empurra o botão para a esquerda */
    padding: 8px;
    color: #666;
    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

// Ajuste no ProfileMenu para não ocupar todo o espaço
const ProfileMenu = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small};
`;

// Estilo para o botão de Logout
const LogoutButton = styled.button`
    display: flex;
    align-items: center;
    font-weight: bold;
    color: #555;
    margin-left: 15px; /* Ajuste a margem se necessário */
    padding: 8px;
    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

export default Topbar; // Mova export default para o final
