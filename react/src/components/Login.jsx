import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e, roleOverride) => {
    if (e) e.preventDefault();
    
    // Dummy login bypass
    if (roleOverride) {
      localStorage.setItem('role', roleOverride);
      navigate(`/${roleOverride}/dashboard`);
      return;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile) {
        localStorage.setItem('role', profile.role);
        navigate(`/${profile.role}/dashboard`);
      }
    } else {
      let role = 'staff';
      if (email.includes('principal')) role = 'principal';
      if (email.includes('hod')) role = 'hod';
      localStorage.setItem('role', role);
      navigate(`/${role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">E-Circular System</h2>
        <p className="mt-2 text-sm text-gray-600">Choose your portal to login</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="space-y-4 mb-8">
            <p className="text-sm text-center font-medium text-gray-500 mb-4">Quick Testing Logins</p>
            <button onClick={() => handleLogin(null, 'staff')} className="w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
              Login as Staff
            </button>
            <button onClick={() => handleLogin(null, 'hod')} className="w-full py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100">
              Login as HOD
            </button>
            <button onClick={() => handleLogin(null, 'principal')} className="w-full py-2 px-4 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100">
              Login as Principal
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => handleLogin(e, null)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
          
          {!supabase && (
            <p className="mt-4 text-xs text-red-500 text-center">
              Supabase not connected. Using local mock login.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
