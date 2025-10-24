import React from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Fundo escurecido */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; /* Acima do Topbar e Sidebar */
`;

const ModalContent = styled.div`
    background-color: #f8f9fa; /* Cinza claro */
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 700px; /* Largura máxima do modal */
    max-height: 80vh; /* Altura máxima, com scroll */
    overflow-y: auto;
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
`;

const ModalTitle = styled.h2`
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
`;

const ModalBody = styled.div`
    color: #333;
    line-height: 1.6;

    h3 {
        color: ${({ theme }) => theme.colors.primary};
        margin-top: 20px;
        margin-bottom: 10px;
    }

    p {
        margin-bottom: 15px;
    }

    ul,
    ol {
        margin-left: 20px;
        margin-bottom: 15px;
    }

    li {
        margin-bottom: 8px;
    }

    code {
        background-color: #e9ecef;
        padding: 2px 5px;
        border-radius: 4px;
        font-family: monospace;
    }
`;

const HelpModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) {
        return null;
    }

    // Permite renderizar HTML simples ou Markdown básico (parágrafos, listas)
    // Para Markdown completo, precisaríamos de uma biblioteca como 'react-markdown'
    const renderContent = () => {
        if (!content) {
            return <p>Conteúdo de ajuda não disponível para esta página.</p>;
        }

        const blocks = content.split("\n\n"); // Divide em blocos (parágrafos ou listas)

        return blocks.map((block, blockIndex) => {
            const lines = block.split("\n");
            // Verifica se todas as linhas não vazias do bloco começam como item de lista
            const isListBlock = lines.every(
                (line) =>
                    line.trim() === "" ||
                    line.trim().startsWith("* ") ||
                    line.trim().startsWith("- ")
            );

            if (
                isListBlock &&
                lines.some(
                    (line) =>
                        line.trim().startsWith("* ") ||
                        line.trim().startsWith("- ")
                )
            ) {
                // Renderiza como lista não ordenada
                return (
                    <ul key={blockIndex}>
                        {lines
                            .map((line) => line.trim()) // Remove espaços extras
                            .filter(
                                (line) =>
                                    line.startsWith("* ") ||
                                    line.startsWith("- ")
                            ) // Filtra apenas itens de lista válidos
                            .map((line, lineIndex) => {
                                // Remove o marcador ('* ' ou '- ') do início
                                const itemText = line.substring(2).trim();
                                // Aplica formatação básica (negrito e código)
                                // Substitui **texto** por <strong>texto</strong>
                                let formattedText = itemText.replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>"
                                );
                                // Substitui `codigo` por <code>codigo</code>
                                formattedText = formattedText.replace(
                                    /`(.*?)`/g,
                                    "<code>$1</code>"
                                );
                                // Usa dangerouslySetInnerHTML para renderizar o HTML básico
                                return (
                                    <li
                                        key={lineIndex}
                                        dangerouslySetInnerHTML={{
                                            __html: formattedText,
                                        }}
                                    />
                                );
                            })}
                    </ul>
                );
            } else {
                // Renderiza como parágrafo, tratando quebras de linha e formatação básica
                // Aplica formatação básica (negrito e código)
                let formattedBlock = block.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                );
                formattedBlock = formattedBlock.replace(
                    /`(.*?)`/g,
                    "<code>$1</code>"
                );
                // Substitui novas linhas por <br /> dentro do parágrafo
                formattedBlock = formattedBlock.replace(/\n/g, "<br />");
                return (
                    <p
                        key={blockIndex}
                        dangerouslySetInnerHTML={{ __html: formattedBlock }}
                    />
                );
            }
        });
    };

    return (
        <ModalOverlay onClick={onClose}>
            {/* Impede que o clique dentro do modal o feche */}
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
                <ModalTitle>{title || "Ajuda"}</ModalTitle>
                <ModalBody>
                    {/* Se o conteúdo for um objeto com estrutura, ajuste aqui */}
                    {typeof content === "string" ? (
                        renderContent()
                    ) : (
                        <p>Formato de conteúdo inválido.</p>
                    )}
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

export default HelpModal;
