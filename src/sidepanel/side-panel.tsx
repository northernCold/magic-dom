import { useState, useCallback } from 'react';
import { DomOperator } from './components/dom-operator';
import { SavedOperations } from './components/saved-operations';
// @ts-ignore
import './side-panel.css';
import { Toaster } from "@/components/ui/sonner"

function SidePanel() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleOperationSaved = useCallback(() => {
    setRefreshFlag(prev => !prev);
  }, []);

  return (
    <main className="p-4">
      <div className="space-y-4">
        <DomOperator onSaved={handleOperationSaved} />
        <SavedOperations refresh={refreshFlag} />
      </div>
      <Toaster />
    </main>
  );
}

export default SidePanel;