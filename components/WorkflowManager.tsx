import React, { useState } from 'react';
import styled from 'styled-components';

// Styles futuristes
const Container = styled.div`
  background-color: #121212;
  color: #00ff9d;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 255, 157, 0.3);
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  color: #00ff9d;
  text-align: center;
`;

const Button = styled.button`
  background-color: #00ff9d;
  color: #121212;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #00e68a;
  }
`;

const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<string[]>([]);

  const addWorkflow = () => {
    setWorkflows([...workflows, `Workflow ${workflows.length + 1}`]);
  };

  const removeWorkflow = (index: number) => {
    const newWorkflows = workflows.filter((_, i) => i !== index);
    setWorkflows(newWorkflows);
  };

  return (
    <Container>
      <Title>Workflow Manager</Title>
      <Button onClick={addWorkflow}>Add Workflow</Button>
      <div>
        {workflows.map((workflow, index) => (
          <div key={index}>
            {workflow}
            <Button onClick={() => removeWorkflow(index)}>Remove</Button>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default WorkflowManager;
