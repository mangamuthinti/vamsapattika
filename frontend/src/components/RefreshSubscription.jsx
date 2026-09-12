import React from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';

const RefreshSubscription = () => {
  const { refreshSubscription, userPlan, planLoading } = useFamilyTree();

  const handleRefresh = async () => {
    console.log('🔄 Manual subscription refresh triggered');
    await refreshSubscription();
    console.log('✅ Subscription refreshed:', userPlan);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={planLoading}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: planLoading ? 'not-allowed' : 'pointer',
        opacity: planLoading ? 0.6 : 1
      }}
    >
      {planLoading ? 'Refreshing...' : 'Refresh Subscription'}
    </button>
  );
};

export default RefreshSubscription;
