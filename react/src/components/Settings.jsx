import React, { useState } from 'react';

export default function Settings() {
  const role = localStorage.getItem('role') || 'staff';
  const [signature, setSignature] = useState(localStorage.getItem(`${role}_signature`) || null);
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'light');

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSignature(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (signature && role !== 'staff') {
      localStorage.setItem(`${role}_signature`, signature);
    }
    localStorage.setItem('app_theme', theme);
    window.dispatchEvent(new Event('theme-changed'));
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">User Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {role !== 'staff' && (
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-4">Edit Signature</h3>
            <p className="text-sm text-gray-500 mb-4">Upload a signature to append to circulars you approve.</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleSignatureUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {signature && (
              <div className="mt-4 border p-4 inline-block rounded bg-gray-50">
                <img src={signature} alt="Signature Preview" className="h-16 object-contain" />
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-8">Edit Password</h3>
          <input 
            type="password" 
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-8">App Theme</h3>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
