// components/WorkflowTrigger.tsx
import React, { useState } from "react";

type Props = {
  selectedContacts: string[];
};

export const WorkflowTrigger: React.FC<Props> = ({ selectedContacts }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleTrigger = async () => {
    setStatus("sending");
    try {
      const res = await fetch("https://noeplantier.app.n8n.cloud/webhook/6f7b288e-1efe-4504-a6fd-660931327269", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: selectedContacts }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="workflow-trigger">
      <button disabled={status === "sending"} onClick={handleTrigger}>
        🚨 Déclencher l'alerte
      </button>
      {status === "sent" && <p>✅ Alerte envoyée avec succès !</p>}
      {status === "error" && <p>❌ Une erreur est survenue.</p>}
    </div>
  );
};
