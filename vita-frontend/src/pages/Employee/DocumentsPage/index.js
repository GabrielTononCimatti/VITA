import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import {
    getDocumentsForStep,
    addDocument,
    deleteDocument,
} from "../../../services/documentService";
import { useAuth } from "../../../contexts/AuthContext";
import { FaEye, FaTrash } from "react-icons/fa";

// --- Styled Components ---
const PageLayout = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: ${({ theme }) => theme.spacing.large};
    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;
const Box = styled.div`
    background-color: white;
    padding: ${({ theme }) => theme.spacing.large};
    border-radius: ${({ theme }) => theme.borderRadius};
`;
const Title = styled.h1`...`;

const UploadForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const UploadTypeSelector = styled.div`
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
`;

const DocumentsPage = () => {
    const { projectId, etapaId } = useParams();
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [docName, setDocName] = useState("");

    const [uploadType, setUploadType] = useState("link");
    const [link, setLink] = useState("");
    const [file, setFile] = useState(null);

    const loadDocuments = useCallback(async () => {
        const response = await getDocumentsForStep(projectId, etapaId);
        setDocuments(response.data);
    }, [projectId, etapaId]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleAddDocument = async (e) => {
        e.preventDefault();

        if (uploadType === "link" && !link) {
            alert("Por favor, insira um link.");
            return;
        }
        if (uploadType === "file" && !file) {
            alert("Por favor, selecione um arquivo.");
            return;
        }

        const docData = {
            name: docName || (uploadType === "link" ? `Link` : file.name),
            uploadDate: new Date().toISOString(),
            uploadedBy: user.name,
            projectId,
            etapaId: parseInt(etapaId),
        };

        if (uploadType === "link") {
            docData.url = link;
        } else {
            docData.url = URL.createObjectURL(file);
            docData.isLocalFile = true;
        }

        await addDocument(docData);
        loadDocuments();

        setDocName("");
        setLink("");
        setFile(null);
        if (e.target.nodeName === "FORM") e.target.reset(); // Limpa o input de arquivo
        alert("Documento adicionado!");
    };

    const handleDeleteDocument = async (documentId) => {
        if (window.confirm("Tem certeza que deseja excluir este documento?")) {
            try {
                await deleteDocument(documentId);
                alert("Documento excluído com sucesso!");
                loadDocuments(); // Recarrega a lista
            } catch (error) {
                alert("Erro ao excluir o documento.");
            }
        }
    };

    // const handleAddLink = async (e) => {
    //     e.preventDefault();
    //     if (!link) return;
    //     const newDoc = {
    //         name: `Link - ${new Date().toLocaleDateString()}`,
    //         url: link,
    //         uploadDate: new Date().toISOString(),
    //         uploadedBy: user.name,
    //         projectId,
    //         etapaId: parseInt(etapaId),
    //     };
    //     const createdDoc = await addDocument(newDoc);
    //     setDocuments([...documents, createdDoc]);
    //     setLink("");
    //     alert("Link adicionado!");
    // };

    return (
        <div>
            <Title>Documentos da Etapa</Title>
            <PageLayout>
                <Box>
                    <h3>Documentos Enviados</h3>
                    <table width="100%" style={{ marginTop: "20px" }}>
                        <thead>
                            <tr>
                                <th align="left">Nome</th>
                                <th align="left">Enviado por</th>
                                <th align="left">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id}>
                                    <td>{doc.name}</td>
                                    <td>{doc.uploadedBy}</td>
                                    <td
                                        style={{ display: "flex", gap: "10px" }}
                                    >
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaEye />
                                        </a>
                                        {(user.role === "admin" ||
                                            user.role === "employee") && (
                                            <FaTrash
                                                style={{
                                                    cursor: "pointer",
                                                    color: "red",
                                                }}
                                                onClick={() =>
                                                    handleDeleteDocument(doc.id)
                                                }
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                <Box>
                    <h3>Anexar Novo Documento</h3>
                    <UploadForm onSubmit={handleAddDocument}>
                        <input
                            type="text"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            placeholder="Nome do Documento (opcional)"
                            style={{ width: "100%", padding: "8px" }}
                        />

                        <UploadTypeSelector>
                            <label>
                                <input
                                    type="radio"
                                    name="uploadType"
                                    value="link"
                                    checked={uploadType === "link"}
                                    onChange={() => setUploadType("link")}
                                />
                                Anexar Link
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="uploadType"
                                    value="file"
                                    checked={uploadType === "file"}
                                    onChange={() => setUploadType("file")}
                                />
                                Anexar Arquivo
                            </label>
                        </UploadTypeSelector>

                        {uploadType === "link" ? (
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://..."
                            />
                        ) : (
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        )}

                        <button type="submit">Adicionar Documento</button>
                    </UploadForm>
                    {/* <h3>Anexar Documentos</h3>
                    <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Nome do Documento (opcional)"
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "15px",
                        }}
                    />

                    <form onSubmit={(e) => handleAddDocument(e, "link")}>
                        <label>Anexar Link</label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                            required
                        />
                        <button type="submit">Adicionar Link</button>
                    </form>

                    <hr style={{ margin: "20px 0" }} /> */}

                    {/* <label>Anexar Arquivo (PDF, máx 3MB)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        style={{ width: "100%", marginTop: "10px" }}
                    /> */}
                    {/* <form onSubmit={(e) => handleAddDocument(e, "file")}>
                        <label>Anexar Arquivo</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button type="submit" disabled={!file}>
                            Adicionar Arquivo
                        </button>
                    </form> */}
                </Box>
            </PageLayout>
        </div>
    );
};

export default DocumentsPage;
