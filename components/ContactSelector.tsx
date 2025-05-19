import React, { useState } from 'react';
import styles from './ContactSelector.module.css';

const ContactSelector = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Agent Alpha' },
    { id: 2, name: 'Agent Beta' },
    { id: 3, name: 'Agent Gamma' },
  ]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select AI Agent</h2>
      <ul className={styles.contactList}>
        {contacts.map(contact => (
          <li key={contact.id} className={styles.contactItem}>
            {contact.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactSelector;
