import { supabase } from '../lib/supabase';

export interface Thread {
  id: string;
  author_id: string;
  software_id?: string;
  content: string;
  media_urls?: string[];
  score: number;
  created_at: string;
  updated_at: string;
  author_profile?: {
    username: string;
    avatar_url?: string;
    role: string;
  };
  software?: {
    name: string;
    id: string;
  };
  comments_count?: number;
  reactions?: {
    like: number;
    cheer: number;
    bug: number;
    suggestion: number;
  };
  user_reaction?: string | null;
}

export interface Comment {
  id: string;
  thread_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author_profile?: {
    username: string;
    avatar_url?: string;
    role: string;
  };
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  thread_id?: string;
  comment_id?: string;
  user_id: string;
  type: 'like' | 'cheer' | 'bug' | 'suggestion';
  created_at: string;
}

export interface CreateThreadData {
  content: string;
  software_id?: string;
  media_urls?: string[];
}

export interface CreateCommentData {
  thread_id: string;
  content: string;
  parent_id?: string;
}

export const threadsApi = {
  async createThread(data: CreateThreadData) {
    const { data: result, error } = await supabase
      .from('threads')
      .insert([data])
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role),
        software:software_id(name, id)
      `)
      .single();

    if (error) throw error;
    return result as Thread;
  },

  async getThreads(options?: {
    sort?: 'latest' | 'popular';
    software_id?: string;
    author_id?: string;
    limit?: number;
    offset?: number;
  }) {
    const { sort = 'latest', software_id, author_id, limit = 20, offset = 0 } = options || {};

    let query = supabase
      .from('threads')
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role),
        software:software_id(name, id)
      `);

    if (software_id) {
      query = query.eq('software_id', software_id);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    if (sort === 'popular') {
      query = query.order('score', { ascending: false })
                  .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // 각 스레드에 대한 댓글 수와 반응 정보 가져오기
    const threadsWithStats = await Promise.all(
      (data as Thread[]).map(async (thread) => {
        const [commentsCount, reactions, userReaction] = await Promise.all([
          threadsApi.getCommentsCount(thread.id),
          threadsApi.getThreadReactions(thread.id),
          threadsApi.getUserThreadReaction(thread.id)
        ]);

        return {
          ...thread,
          comments_count: commentsCount,
          reactions,
          user_reaction: userReaction
        };
      })
    );

    return threadsWithStats;
  },

  async getThread(id: string) {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role),
        software:software_id(name, id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const [commentsCount, reactions, userReaction] = await Promise.all([
      threadsApi.getCommentsCount(id),
      threadsApi.getThreadReactions(id),
      threadsApi.getUserThreadReaction(id)
    ]);

    return {
      ...data,
      comments_count: commentsCount,
      reactions,
      user_reaction: userReaction
    } as Thread;
  },

  async updateThread(id: string, updates: Partial<CreateThreadData>) {
    const { data, error } = await supabase
      .from('threads')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role),
        software:software_id(name, id)
      `)
      .single();

    if (error) throw error;
    return data as Thread;
  },

  async deleteThread(id: string) {
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getComments(threadId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role)
      `)
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 댓글을 트리 구조로 변환
    const comments = data as Comment[];
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  },

  async getCommentsCount(threadId: string) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('thread_id', threadId)
      .eq('is_deleted', false);

    if (error) throw error;
    return count || 0;
  },

  async createComment(data: CreateCommentData) {
    const { data: result, error } = await supabase
      .from('comments')
      .insert([data])
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role)
      `)
      .single();

    if (error) throw error;
    return result as Comment;
  },

  async updateComment(id: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, is_edited: true })
      .eq('id', id)
      .select(`
        *,
        author_profile:author_id(username, avatar_url, role)
      `)
      .single();

    if (error) throw error;
    return data as Comment;
  },

  async deleteComment(id: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ is_deleted: true, content: '삭제된 댓글입니다.' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleThreadReaction(threadId: string, type: 'like' | 'cheer' | 'bug' | 'suggestion') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    // 기존 반응 확인
    const { data: existingReaction } = await supabase
      .from('reactions')
      .select('*')
      .eq('thread_id', threadId)
      .eq('user_id', profile.id)
      .eq('type', type)
      .maybeSingle();

    if (existingReaction) {
      // 기존 반응 삭제 (토글)
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) throw error;
      return null;
    } else {
      // 새 반응 추가
      const { data, error } = await supabase
        .from('reactions')
        .insert([{
          thread_id: threadId,
          user_id: profile.id,
          type
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Reaction;
    }
  },

  async getThreadReactions(threadId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select('type')
      .eq('thread_id', threadId);

    if (error) throw error;

    const reactions = {
      like: 0,
      cheer: 0,
      bug: 0,
      suggestion: 0
    };

    data.forEach((reaction) => {
      reactions[reaction.type as keyof typeof reactions]++;
    });

    return reactions;
  },

  async getUserThreadReaction(threadId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return null;

    const { data, error } = await supabase
      .from('reactions')
      .select('type')
      .eq('thread_id', threadId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (error) return null;
    return data?.type || null;
  }
};