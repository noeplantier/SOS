import React, { useState } from 'react';
import styles from '../styles/EmergencyWorkflowBuilder.module.css'; // Adjust the path as necessary

const EmergencyWorkflowBuilder = () => {
  const [steps, setSteps] = useState([
    { id: 1, description: 'Step 1: Initialize' },
    { id: 2, description: 'Step 2: Analyze' },
    { id: 3, description: 'Step 3: Execute' },
  ]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Build Emergency Workflow</h2>
      <ul className={styles.stepList}>
        {steps.map(step => (
          <li key={step.id} className={styles.stepItem}>
            {step.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmergencyWorkflowBuilder;
