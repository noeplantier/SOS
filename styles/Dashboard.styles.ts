import styled from 'styled-components';

interface DashboardContainerProps {
  isOver: boolean;
}

export const DashboardContainer = styled.div<DashboardContainerProps>`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 10px;
  min-height: 200px;
  border: ${({ isOver }) => (isOver ? '2px dashed #00ff9d' : '2px dashed #333')};
`;
