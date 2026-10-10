import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCirculars } from '../lib/db';

export default function ApprovedDocuments() {
  const role = localStorage.getItem('role') || 'staff';
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        let data = [];
        // Use principal to get all approved and pending docs, then strictly filter
        const fetched = await getCirculars('principal');
        data = fetched.filter(c => c.status === 'approved');
        
        setCirculars(data);
      } catch (err) {
        console.error('Failed to load approved circulars:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Approved Circulars</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading documents...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50 flex justify-between items-center">
            <h2 className="font-semibold text-green-800">Finalized Documents</h2>
          </div>
          
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
              {circulars.map((circ) => (
                <tr key={circ.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{circ.title || 'Untitled Circular'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(circ.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/circular/${circ.id}`} className="text-green-700 hover:text-green-900 bg-green-50 px-3 py-1 rounded border border-green-200">View Document</Link>
                  </td>
                </tr>
              ))}
              {circulars.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No approved documents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
