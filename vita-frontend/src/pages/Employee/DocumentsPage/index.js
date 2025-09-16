// Caminho: vita-frontend/src/pages/Employee/DocumentsPage/index.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
    getDocumentsByStage,
    addDocumentLink,
    addDocumentFile,
    deleteDocument,
} from "../../../services/documentService";
import { getDisplayName } from "../../../utils/peopleUtils";
import { FaEye, FaTrash } from "react-icons/fa";

// --- Styled Components (Preservados) ---
const PageWrapper = styled.div`
    padding: 24px;
`;
// ... (demais styled-components mantidos)
const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 32px;
    margin-top: 24px;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

const ListSection = styled.div`
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormSection = styled.div`
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    align-self: start;
`;

const SectionTitle = styled.h2`
    margin-top: 0;
`;

const DocumentTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        padding: 12px 8px;
        text-align: left;
        border-bottom: 1px solid #f1f1f1;
    }
`;

const RadioGroup = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 16px;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    font-weight: bold;
    cursor: pointer;
    &:disabled {
        background-color: #ccc;
    }
`;

// --- Componente ---
const DocumentsPage = () => {
    // CORREÇÃO: Capturando ambos os parâmetros da URL
    const { projectId, etapaId } = useParams();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [uploadType, setUploadType] = useState("link");
    const [formData, setFormData] = useState({ name: "", url: "", file: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDocuments = async () => {
        if (!projectId || !etapaId) return;
        try {
            setLoading(true);
            // CORREÇÃO: Passando ambos os IDs para o serviço
            const data = await getDocumentsByStage(projectId, etapaId);

            console.log("Documentos recebidos: ", data);
            // O backend já anexa os dados do usuário em cada documento
            setDocuments(data.document || []);
        } catch (err) {
            setError("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [projectId, etapaId]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            setFormData((prev) => ({ ...prev, file: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const stageID = `projects/${projectId}/stages/${etapaId}`;

            if (uploadType === "link") {
                if(!formData.name)
                    formData.name=formData.url
                await addDocumentLink({
                    name: formData.name,
                    url: formData.url,
                    stageID: stageID,
                });
            } else {
                console.log("Enviando AQUIII:");
                console.log(formData.name);

                const data = new FormData();
                data.append("file", formData.file);

                const metaData = {
                    name: formData.name,
                    stageID: stageID,
                };

                data.append("data", JSON.stringify(metaData));

                console.log(data);

                await addDocumentFile(data);
            }

            console.log(formData);
            alert("Documento adicionado com sucesso!");
            setFormData({ name: "", url: "", file: null });
            fetchDocuments();
        } catch (err) {
            alert("Erro ao adicionar documento.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (docId) => {
        if (window.confirm("Tem certeza que deseja excluir este documento?")) {
            try {
                await deleteDocument(docId);
                alert("Documento excluído com sucesso!");
                fetchDocuments();
            } catch (err) {
                alert("Erro ao excluir documento.");
            }
        }
    };

    const formatUrl = (url) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return `http://${url}`;
        }
        return url;
    };

    if (loading) return <div>Carregando documentos...</div>;

    return (
        <PageWrapper>
            <Title>Gerenciador de Documentos</Title>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <ContentGrid>
                <ListSection>
                    <SectionTitle>Documentos da Etapa</SectionTitle>
                    <DocumentTable>
                        <thead>
                            <tr>
                                <th>Nome do Documento</th>
                                <th>Enviado por</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id}>
                                    <td>{doc.name}</td>
                                    <td>{doc.createdBy}</td>
                                    <td>
                                        {new Date(
                                            doc.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <a
                                            href={formatUrl(doc.url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ marginRight: "10px" }}
                                        >
                                            <FaEye />
                                        </a>
                                        <FaTrash
                                            onClick={() => handleDelete(doc.id)}
                                            style={{
                                                cursor: "pointer",
                                                color: "red",
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </DocumentTable>
                </ListSection>

                <FormSection>
                    <SectionTitle>Adicionar Novo Documento</SectionTitle>
                    <form onSubmit={handleSubmit}>
                        <RadioGroup>
                            <label>
                                <input
                                    type="radio"
                                    value="link"
                                    checked={uploadType === "link"}
                                    onChange={() => setUploadType("link")}
                                />
                                Link
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="file"
                                    checked={uploadType === "file"}
                                    onChange={() => setUploadType("file")}
                                />
                                Arquivo
                            </label>
                        </RadioGroup>

                        <FormGroup>
                            <Label>Nome do Documento</Label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </FormGroup>

                        {uploadType === "link" ? (
                            <FormGroup>
                                <Label>URL</Label>
                                <Input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormGroup>
                        ) : (
                            <FormGroup>
                                <Label>Selecione o Arquivo</Label>
                                <Input
                                    type="file"
                                    name="file"
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormGroup>
                        )}
                        <SubmitButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enviando..." : "Adicionar"}
                        </SubmitButton>
                    </form>
                </FormSection>
            </ContentGrid>
        </PageWrapper>
    );
};

export default DocumentsPage;
