import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Placeholder } from './components/Placeholder';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Placeholder title="Suppliers" description="Manage your supplier relationships and purchase orders" />;
      case 'ledgers':
        return <Placeholder title="Ledgers" description="View and manage customer & supplier ledgers with running balance" />;
      case 'expenses':
        return <Placeholder title="Expenses" description="Track and categorize your daily business expenses" />;
      case 'banks':
        return <Placeholder title="Banks & Digital Accounts" description="Manage cash, bank accounts, Easypaisa, and JazzCash transactions" />;
      case 'reports':
        return <Placeholder title="Reports" description="Generate comprehensive sales, profit, and inventory reports" />;
      case 'settings':
        return <Placeholder title="Settings" description="Configure shop information, users, and system preferences" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
