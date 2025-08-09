import { supabase } from '../lib/supabase';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: 'developer' | 'admin';
  current_role: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    bio?: string;
    avatar_url?: string;
  };
  reviewer_profile?: {
    username: string;
  };
}

export const roleRequestsApi = {
  async createRoleRequest(data: {
    requested_role: 'developer' | 'admin';
    reason?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Get the profile.id that corresponds to this auth user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    const { data: result, error } = await supabase
      .from('role_requests')
      .insert({
        requested_role: data.requested_role,
        reason: data.reason,
        user_id: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getUserRoleRequests() {
    const { data, error } = await supabase
      .from('role_requests')
      .select(`
        *,
        reviewer_profile:reviewed_by(username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RoleRequest[];
  },

  async getAllRoleRequests() {
    const { data, error } = await supabase
      .from('role_requests')
      .select(`
        *,
        user_profile:user_id(username, bio, avatar_url),
        reviewer_profile:reviewed_by(username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RoleRequest[];
  },

  async getPendingRoleRequests() {
    const { data, error } = await supabase
      .from('role_requests')
      .select(`
        *,
        user_profile:user_id(username, bio, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as RoleRequest[];
  },

  async approveRoleRequest(requestId: string, adminNotes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Get the admin profile.id
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminProfile) {
      throw new Error('Admin profile not found');
    }

    // First, get the role request details
    const { data: roleRequest, error: fetchError } = await supabase
      .from('role_requests')
      .select('user_id, requested_role')
      .eq('id', requestId)
      .single();

    if (fetchError || !roleRequest) {
      throw new Error('Role request not found');
    }

    // Update the role request status
    const { data, error } = await supabase
      .from('role_requests')
      .update({
        status: 'approved',
        admin_notes: adminNotes,
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    console.log('Attempting to update user role:', {
      userId: roleRequest.user_id,
      newRole: roleRequest.requested_role,
      adminId: adminProfile.id
    });

    // Manually update the user's role in profiles table
    const { data: profileUpdateData, error: roleUpdateError } = await supabase
      .from('profiles')
      .update({
        role: roleRequest.requested_role,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleRequest.user_id)
      .select();

    if (roleUpdateError) {
      console.error('Failed to update user role:', roleUpdateError);
      throw new Error(`Failed to update user role: ${roleUpdateError.message}`);
    }

    console.log('Role update successful:', profileUpdateData);

    // Verify the update worked by fetching the updated profile
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', roleRequest.user_id)
      .single();

    console.log('Profile verification after update:', verifyProfile, verifyError);

    // // Send notification to the user
    // const { error: notificationError } = await supabase
    //   .from('notifications')
    //   .insert({
    //     user_id: roleRequest.user_id,
    //     message: `역할 요청이 승인되었습니다. ${adminNotes ? `관리자 메모: ${adminNotes}` : ''}`
    //   });

    // if (notificationError) {
    //   console.error('Failed to send notification:', notificationError);
    // }

    return data;
  },

  async rejectRoleRequest(requestId: string, adminNotes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Get the admin profile.id
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminProfile) {
      throw new Error('Admin profile not found');
    }

    const { data, error } = await supabase
      .from('role_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_by: adminProfile.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelRoleRequest(requestId: string) {
    const { error } = await supabase
      .from('role_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  }
};