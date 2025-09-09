import React from "react";
import styled from "styled-components";

const CardWrapper = styled.div`
    background-color: ${({ theme, bgColor }) => bgColor || theme.colors.white};
    padding: ${({ theme }) => theme.spacing.large};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    text-align: center;
    flex: 1;
    min-width: 200px;
`;

const CardTitle = styled.h3`
    font-size: 16px;
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const CardCount = styled.p`
    font-size: 36px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
`;

const StatCard = ({ title, count, color }) => {
    return (
        <CardWrapper bgColor={color}>
            <CardTitle>{title}</CardTitle>
            <CardCount>{count}</CardCount>
        </CardWrapper>
    );
};

export default StatCard;
