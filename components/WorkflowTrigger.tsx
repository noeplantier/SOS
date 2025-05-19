import { useState } from 'react';
import styles from '../styles/WorkflowTrigger.module.css';

const WorkflowTrigger = () => {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Workflow 1' },
    { id: 2, name: 'Workflow 2' },
    { id: 3, name: 'Workflow 3' },
  ]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Trigger Workflow</h2>
      <ul className={styles.workflowList}>
        {workflows.map(workflow => (
          <li key={workflow.id} className={styles.workflowItem}>
            {workflow.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkflowTrigger;
