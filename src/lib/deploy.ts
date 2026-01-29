import { supabaseAdmin } from './supabase';

const VERCEL_DEPLOY_HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_wJX3HbHZ3hqvVJwc3KlZHPZmw6QQ/uJt6BiTbQd';
const VERCEL_PROJECT_ID = 'prj_wJX3HbHZ3hqvVJwc3KlZHPZmw6QQ';

export interface DeploymentStatus {
  isDeploying: boolean;
  lastDeployedAt: string | null;
  hasPendingChanges: boolean;
  currentDeployment?: {
    id: string;
    state: string;
    url?: string;
    createdAt: string;
  };
}

export async function getLastDeployedAt(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'last_deployed_at')
    .single();

  return data?.value ? String(data.value).replace(/"/g, '') : null;
}

export async function setLastDeployedAt(timestamp: string): Promise<void> {
  await supabaseAdmin
    .from('settings')
    .upsert({ key: 'last_deployed_at', value: JSON.stringify(timestamp), updated_at: new Date().toISOString() });
}

export async function getLastContentModifiedAt(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'last_content_modified_at')
    .single();

  return data?.value ? String(data.value).replace(/"/g, '') : null;
}

export async function markContentModified(): Promise<void> {
  await supabaseAdmin
    .from('settings')
    .upsert({ key: 'last_content_modified_at', value: JSON.stringify(new Date().toISOString()), updated_at: new Date().toISOString() });
}

export async function hasPendingChanges(): Promise<boolean> {
  const lastDeployed = await getLastDeployedAt();
  const lastModified = await getLastContentModifiedAt();

  if (!lastModified) return false;
  if (!lastDeployed) return true;

  return new Date(lastModified) > new Date(lastDeployed);
}

export async function getVercelDeployments(): Promise<any[]> {
  const token = import.meta.env.VERCEL_API_KEY;
  if (!token) return [];

  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.deployments || [];
  } catch {
    return [];
  }
}

export async function getDeploymentStatus(): Promise<DeploymentStatus> {
  const lastDeployedAt = await getLastDeployedAt();
  const pendingChanges = await hasPendingChanges();

  let isDeploying = false;
  let currentDeployment;

  const deployments = await getVercelDeployments();
  const latest = deployments[0];

  if (latest) {
    isDeploying = ['BUILDING', 'QUEUED', 'INITIALIZING'].includes(latest.state);
    currentDeployment = {
      id: latest.uid,
      state: latest.state,
      url: latest.url,
      createdAt: new Date(latest.createdAt).toISOString(),
    };
  }

  return {
    isDeploying,
    lastDeployedAt,
    hasPendingChanges: pendingChanges,
    currentDeployment,
  };
}

export async function triggerDeploy(): Promise<boolean> {
  try {
    const response = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
    return response.ok;
  } catch {
    return false;
  }
}
