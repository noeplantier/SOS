// components/EmergencyWorkflowBuilder.tsx
import React, { useState } from "react";
import { ContactSelector } from "./ContactSelector";
import { WorkflowTrigger } from "./WorkflowTrigger";

const dummyContacts = [
  { id: "1", name: "Alice", email: "alice@email.com" },
  { id: "2", name: "Bob", email: "bob@email.com" },
  { id: "3", name: "Charlie", email: "charlie@email.com" },
];

export const EmergencyWorkflowBuilder: React.FC = () => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  return (
    <div className="emergency-workflow">
      <h2>🛠️ Créateur d'alerte d'urgence</h2>
      <ContactSelector
        contacts={dummyContacts}
        selected={selectedContacts}
        onChange={setSelectedContacts}
      />
      <WorkflowTrigger selectedContacts={selectedContacts} />
    </div>
  );
};
