import { supabase } from './supabase';

export async function saveCircular(circular) {
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Add author_id if a user is logged in
    const circularToSave = { ...circular };
    if (user) {
      circularToSave.author_id = user.id;
    }
    // Don't send null/undefined ID to Postgres, let it generate a UUID
    if (!circularToSave.id) {
      delete circularToSave.id;
    }

    const { data, error } = await supabase.from('circulars').upsert([circularToSave]).select();
    if (error) {
      console.error('Supabase Save Error:', error);
      throw error;
    }
    return data[0];
  } else {
    // LocalStorage fallback
    const existing = JSON.parse(localStorage.getItem('mock_circulars') || '[]');
    const isNew = !circular.id;
    const newCircular = { 
      ...circular, 
      id: circular.id || Date.now().toString(), 
      created_at: circular.created_at || new Date().toISOString(),
      status: circular.status || 'draft'
    };
    
    if (isNew) {
      existing.unshift(newCircular);
    } else {
      const idx = existing.findIndex(c => c.id === circular.id);
      if (idx !== -1) existing[idx] = newCircular;
    }
    
    localStorage.setItem('mock_circulars', JSON.stringify(existing));
    return newCircular;
  }
}

export async function getCirculars(role) {
  if (supabase) {
    let query = supabase.from('circulars').select('*').order('created_at', { ascending: false });
    
    // Filter by role so HOD/Principal only see relevant docs
    if (role === 'hod') {
      query = query.in('status', ['pending_hod', 'approved', 'rejected', 'pending_principal']);
    } else if (role === 'principal') {
      query = query.in('status', ['pending_principal', 'approved', 'rejected']);
    }
    // Staff sees all (drafts, rejected, pending, approved)

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } else {
    const existing = JSON.parse(localStorage.getItem('mock_circulars') || '[]');
    if (role === 'hod') return existing.filter(c => ['pending_hod', 'approved', 'rejected', 'pending_principal'].includes(c.status));
    if (role === 'principal') return existing.filter(c => ['pending_principal', 'approved', 'rejected'].includes(c.status));
    return existing;
  }
}

export async function getCircularById(id) {
  if (supabase) {
    const { data, error } = await supabase.from('circulars').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } else {
    const existing = JSON.parse(localStorage.getItem('mock_circulars') || '[]');
    return existing.find(c => c.id === id) || null;
  }
}

export async function getCircularComments(circularId) {
  let supabaseComments = [];
  if (supabase) {
    const { data, error } = await supabase.from('circular_approvals')
      .select('*')
      .eq('circular_id', circularId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      supabaseComments = data;
    }
  }
  const localComments = JSON.parse(localStorage.getItem(`mock_comments_${circularId}`) || '[]');
  // Merge both and sort by created_at descending
  return [...supabaseComments, ...localComments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function submitWorkflowAction(circularId, role, action, comments = '') {
  // Determine new status based on role and action
  let newStatus = 'draft';
  if (role === 'staff' && action === 'send_hod') newStatus = 'pending_hod';
  
  if (role === 'hod' && action === 'approve') newStatus = 'pending_principal';
  if (role === 'hod' && action === 'reject') newStatus = 'rejected';
  
  if (role === 'principal' && action === 'approve') newStatus = 'approved';
  if (role === 'principal' && action === 'reject') newStatus = 'rejected';

  if (supabase) {
    // 1. Update circular status
    const { error: updateErr } = await supabase.from('circulars').update({ status: newStatus }).eq('id', circularId);
    if (updateErr) throw updateErr;

    // 2. Insert workflow record for history and comments
    if (comments || action === 'approve' || action === 'reject') {
      const { error: insertErr } = await supabase.from('circular_approvals').insert([{
        circular_id: circularId,
        approver_role: role,
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
        comments: comments
      }]);
      // If RLS blocks it, fallback to local storage
      if (insertErr) {
        console.warn("Supabase insert failed, falling back to local storage for comment:", insertErr);
        const mockComments = JSON.parse(localStorage.getItem(`mock_comments_${circularId}`) || '[]');
        mockComments.unshift({
          id: Date.now().toString(),
          approver_role: role,
          status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
          comments,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(`mock_comments_${circularId}`, JSON.stringify(mockComments));
      }
    }
  } else {
    // LocalStorage fallback
    const existing = JSON.parse(localStorage.getItem('mock_circulars') || '[]');
    const idx = existing.findIndex(c => c.id === circularId);
    if (idx !== -1) {
      existing[idx].status = newStatus;
      localStorage.setItem('mock_circulars', JSON.stringify(existing));
      
      const mockComments = JSON.parse(localStorage.getItem(`mock_comments_${circularId}`) || '[]');
      mockComments.unshift({
        id: Date.now().toString(),
        approver_role: role,
        status: action,
        comments,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(`mock_comments_${circularId}`, JSON.stringify(mockComments));
    }
  }
  return newStatus;
}
