import React from 'react';
import { ReceivablesBreakdown } from '../components/receivables/ReceivablesBreakdown';

export const ReceivablesPage: React.FC = () => {
  return (
    <div className="pb-20 sm:pb-8">
      <ReceivablesBreakdown />
    </div>
  );
};
