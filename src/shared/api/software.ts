import { supabase } from '../lib/supabase';

export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  image_url?: string;
  download_url: string;
  github_url?: string;
  developer_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface CreateSoftwareData {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  image_url?: string;
  download_url: string;
  github_url?: string;
}

export interface UpdateSoftwareData extends Partial<CreateSoftwareData> {}

export const softwareApi = {
  async createSoftware(data: CreateSoftwareData) {
    // Get current user's profile first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    // Create software with developer_id
    const { data: result, error } = await supabase
      .from('softwares')
      .insert([{ ...data, developer_id: profile.id }])
      .select('*')
      .single();

    if (error) {
      console.error('createSoftware error:', error);
      throw error;
    }

    // Fetch profile separately
    const { data: devProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', result.developer_id)
      .single();

    return { ...result, profiles: devProfile } as Software;
  },

  async getSoftwareList(filters?: {
    category?: string;
    tags?: string[];
    search?: string;
    developer_id?: string;
  }) {
    let query = supabase
      .from('softwares')
      .select('*')
      .eq('is_archived', false);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.developer_id) {
      query = query.eq('developer_id', filters.developer_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('API error:', error);
      throw error;
    }

    // Fetch profiles for all softwares
    if (data && data.length > 0) {
      const developerIds = [...new Set(data.map(s => s.developer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', developerIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(software => ({
        ...software,
        profiles: profilesMap.get(software.developer_id) ? {
          username: profilesMap.get(software.developer_id)!.username,
          avatar_url: profilesMap.get(software.developer_id)!.avatar_url
        } : undefined
      })) as Software[];
    }
    
    return data as Software[];
  },

  async getSoftwareById(id: string) {
    const { data, error } = await supabase
      .from('softwares')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('API error:', error);
      throw error;
    }

    // Fetch profile separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', data.developer_id)
      .single();

    return { ...data, profiles: profile } as Software;
  },

  async updateSoftware(id: string, updates: UpdateSoftwareData) {
    const { data, error } = await supabase
      .from('softwares')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('API error:', error);
      throw error;
    }

    // Fetch profile separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', data.developer_id)
      .single();

    return { ...data, profiles: profile } as Software;
  },

  async archiveSoftware(id: string) {
    const { data, error } = await supabase
      .from('softwares')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API error:', error);
      throw error;
    }
    return data;
  },

  async deleteSoftware(id: string) {
    const { error } = await supabase
      .from('softwares')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API error:', error);
      throw error;
    }
  },

  async getMySoftware() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('softwares')
      .select('*')
      .eq('developer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API error:', error);
      throw error;
    }

    // Add profile info to each software
    const { data: devProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', profile.id)
      .single();

    return data.map(software => ({
      ...software,
      profiles: devProfile
    })) as Software[];
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('softwares')
      .select('category')
      .eq('is_archived', false);

    if (error) {
      console.error('API error:', error);
      throw error;
    }
    
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  },

  async getPopularTags(limit = 20) {
    const { data, error } = await supabase
      .from('softwares')
      .select('tags')
      .eq('is_archived', false);

    if (error) {
      console.error('API error:', error);
      throw error;
    }

    const tagCount: Record<string, number> = {};
    
    data.forEach(software => {
      if (software.tags) {
        software.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  }
};