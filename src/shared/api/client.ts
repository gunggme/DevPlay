import { supabase } from '../lib/supabase';
import type { ApiError } from '../types';

class ApiClient {
  private async handleError(error: unknown): Promise<never> {
    console.error('API Error:', error);
    
    const apiError: ApiError = {
      message: (error as Error)?.message || 'An unexpected error occurred',
      code: (error as { code?: string })?.code,
      status: (error as { status?: number })?.status,
      details: (error as { details?: unknown })?.details || error
    };

    throw apiError;
  }

  private async getCurrentUserProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    return { user, profile };
  }

  async get<T>(
    table: string,
    options: {
      select?: string;
      eq?: Record<string, unknown>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    } = {}
  ): Promise<T> {
    try {
      let query = supabase.from(table).select(options.select || '*');

      if (options.eq) {
        Object.entries(options.eq).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }

      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? false 
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = options.single 
        ? await query.single()
        : await query;

      if (error) {
        throw error;
      }

      return data as T;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async insert<T>(table: string, data: Partial<T>, options: { select?: string } = {}): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select(options.select || '*')
        .single();

      if (error) {
        throw error;
      }

      return result as T;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update<T>(
    table: string, 
    data: Partial<T>, 
    conditions: Record<string, unknown>,
    options: { select?: string } = {}
  ): Promise<T> {
    try {
      let query = supabase.from(table).update(data);

      Object.entries(conditions).forEach(([column, value]) => {
        query = query.eq(column, value);
      });

      const { data: result, error } = await query
        .select(options.select || '*')
        .single();

      if (error) {
        throw error;
      }

      return result as T;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(table: string, conditions: Record<string, unknown>): Promise<void> {
    try {
      let query = supabase.from(table);

      Object.entries(conditions).forEach(([column, value]) => {
        query = query.delete().eq(column, value);
      });

      const { error } = await query;

      if (error) {
        throw error;
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Authentication helpers
  getCurrentUser = () => this.getCurrentUserProfile();
}

export const apiClient = new ApiClient();