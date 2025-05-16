// components/ContactSelector.tsx
import React from "react";

type Contact = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  contacts: Contact[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const ContactSelector: React.FC<Props> = ({ contacts, selected, onChange }) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="contact-selector">
      <h3>📇 Sélectionnez les contacts à alerter :</h3>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(contact.id)}
                onChange={() => toggle(contact.id)}
              />
              {contact.name} ({contact.email})
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};
