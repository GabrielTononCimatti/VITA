import React from "react";
import styled from "styled-components";

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
`;

const PageButton = styled.button`
    padding: 8px 12px;
    margin: 0 4px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
    background-color: ${({ active, theme }) =>
        active ? theme.colors.primary : theme.colors.white};
    color: ${({ active, theme }) =>
        active ? theme.colors.white : theme.colors.primary};
    cursor: pointer;
    font-weight: bold;

    &:disabled {
        background-color: #f1f1f1;
        color: #ccc;
        cursor: not-allowed;
        border-color: #ccc;
    }
`;

const Pagination = ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <PaginationContainer>
            <PageButton
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Anterior
            </PageButton>
            {[...Array(totalPages).keys()].map((page) => (
                <PageButton
                    key={page + 1}
                    active={currentPage === page + 1}
                    onClick={() => handlePageClick(page + 1)}
                >
                    {page + 1}
                </PageButton>
            ))}
            <PageButton
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Próxima
            </PageButton>
        </PaginationContainer>
    );
};

export default Pagination;
