import { supabase } from '../lib/supabase';

export interface SoftwareVersion {
  id: string;
  software_id: string;
  version: string;
  changelog?: string | null;
  download_url: string;
  release_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVersionData {
  software_id: string;
  version: string;
  changelog?: string;
  download_url: string;
  release_date?: string;
}

export interface UpdateVersionData {
  version?: string;
  changelog?: string;
  download_url?: string;
  release_date?: string;
}

// 버전 번호 유효성 검사 (vX.Y.Z 형식 권장)
function validateVersionFormat(version: string): boolean {
  // v1.0.0, 1.0.0, v1.0.0-beta, 1.0.0-alpha.1 등을 허용
  const versionRegex = /^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;
  return versionRegex.test(version);
}

export const versionsApi = {
  async createVersion(data: CreateVersionData): Promise<SoftwareVersion> {
    // 버전 형식 검증
    if (!validateVersionFormat(data.version)) {
      throw new Error('버전 형식이 올바르지 않습니다. (예: v1.0.0, 1.2.3)');
    }

    // 중복 버전 체크
    const { data: existingVersion } = await supabase
      .from('software_versions')
      .select('version')
      .eq('software_id', data.software_id)
      .eq('version', data.version)
      .maybeSingle();

    if (existingVersion) {
      throw new Error('이미 존재하는 버전입니다.');
    }

    const { data: result, error } = await supabase
      .from('software_versions')
      .insert([{
        software_id: data.software_id,
        version: data.version,
        changelog: data.changelog || null,
        download_url: data.download_url,
        release_date: data.release_date || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getVersionsBySoftware(softwareId: string): Promise<SoftwareVersion[]> {
    const { data, error } = await supabase
      .from('software_versions')
      .select('*')
      .eq('software_id', softwareId)
      .order('release_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getVersion(id: string): Promise<SoftwareVersion> {
    const { data, error } = await supabase
      .from('software_versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateVersion(id: string, updates: UpdateVersionData): Promise<SoftwareVersion> {
    // 버전 업데이트 시 형식 검증
    if (updates.version && !validateVersionFormat(updates.version)) {
      throw new Error('버전 형식이 올바르지 않습니다. (예: v1.0.0, 1.2.3)');
    }

    // 버전 번호 변경 시 중복 검사
    if (updates.version) {
      const { data: currentVersion } = await supabase
        .from('software_versions')
        .select('software_id')
        .eq('id', id)
        .single();

      if (currentVersion) {
        const { data: existingVersion } = await supabase
          .from('software_versions')
          .select('id')
          .eq('software_id', currentVersion.software_id)
          .eq('version', updates.version)
          .neq('id', id)
          .maybeSingle();

        if (existingVersion) {
          throw new Error('이미 존재하는 버전입니다.');
        }
      }
    }

    const { data, error } = await supabase
      .from('software_versions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVersion(id: string): Promise<void> {
    const { error } = await supabase
      .from('software_versions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getLatestVersion(softwareId: string): Promise<SoftwareVersion | null> {
    const { data, error } = await supabase
      .from('software_versions')
      .select('*')
      .eq('software_id', softwareId)
      .order('release_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 버전 번호 정렬을 위한 유틸리티 함수
  sortVersions(versions: SoftwareVersion[]): SoftwareVersion[] {
    return versions.sort((a, b) => {
      // 릴리즈 날짜로 정렬 (최신순)
      return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
    });
  }
};