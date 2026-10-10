import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCirculars } from '../lib/db';

export default function Dashboard() {
  const role = localStorage.getItem('role') || 'staff';
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCirculars(role);
        setCirculars(data);
      } catch (err) {
        console.error('Failed to load circulars:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getActionRequired = () => {
    if (role === 'hod') return circulars.filter(c => c.status === 'pending_hod');
    if (role === 'principal') return circulars.filter(c => c.status === 'pending_principal');
    if (role === 'staff') return circulars.filter(c => c.status === 'rejected' || c.status === 'draft');
    return circulars;
  };

  const getHistory = () => {
    if (role === 'hod') return circulars.filter(c => c.status !== 'pending_hod');
    if (role === 'principal') return circulars.filter(c => c.status !== 'pending_principal');
    if (role === 'staff') return circulars.filter(c => c.status !== 'rejected' && c.status !== 'draft');
    return [];
  };

  const renderTable = (data, emptyMessage) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-white">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {data.map((circ) => (
          <tr key={circ.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{circ.title || 'Untitled Circular'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${circ.status === 'approved' ? 'bg-green-100 text-green-800' : circ.status.startsWith('rejected') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {circ.status.replace(/_/g, ' ')}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(circ.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <Link to={
                role === 'staff' ? `/staff/circular/edit/${circ.id}` :
                role === 'hod' ? `/hod/circular/${circ.id}/review` :
                role === 'principal' ? `/principal/circular/${circ.id}/approval` :
                `/circular/${circ.id}`
              } className="text-[#2b579a] hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">View Document</Link>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">{emptyMessage}</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
        {role === 'staff' && (
          <Link to="/staff/circular/new" className="bg-[#2b579a] text-white px-4 py-2 rounded-md hover:bg-[#1a3a6c] shadow text-sm font-medium">
            + Create New Circular
          </Link>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading documents...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">All Circulars</h2>
            </div>
            {renderTable(circulars, "No circulars found.")}
          </div>
        </div>
      )}
    </div>
  );
}
