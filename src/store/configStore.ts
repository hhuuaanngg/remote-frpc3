import { create } from 'zustand';
import type { FrpcConfig, ProxyConfig, VisitorConfig } from '@/types/frpc';
import { defaultConfig } from '@/types/frpc';
import { parseToml, generateToml, validateToml } from '@/lib/toml';

interface AppSettings {
  frpcPath: string;
  configPath: string;
  autoLaunch: boolean;
  autoLaunchWithFrpc: boolean;
}

interface ConfigStore {
  config: FrpcConfig;
  rawToml: string;
  isDirty: boolean;
  validationErrors: string[];
  settings: AppSettings;
  lastSavedPath: string | null;
  isLoading: boolean;

  // Actions
  setConfig: (config: FrpcConfig) => void;
  updateField: <K extends keyof FrpcConfig>(field: K, value: FrpcConfig[K]) => void;
  updateLog: (log: FrpcConfig['log']) => void;
  updateAuth: (auth: FrpcConfig['auth']) => void;
  updateWebServer: (ws: FrpcConfig['webServer']) => void;
  updateTransport: (t: FrpcConfig['transport']) => void;
  updateVirtualNet: (vn: FrpcConfig['virtualNet']) => void;
  updateIncludes: (includes: string[]) => void;

  // Proxies
  addProxy: (proxy: ProxyConfig) => void;
  updateProxy: (index: number, proxy: ProxyConfig) => void;
  removeProxy: (index: number) => void;
  moveProxy: (from: number, to: number) => void;

  // Visitors
  addVisitor: (visitor: VisitorConfig) => void;
  updateVisitor: (index: number, visitor: VisitorConfig) => void;
  removeVisitor: (index: number) => void;
  moveVisitor: (from: number, to: number) => void;

  // Import / Export
  loadFromToml: (toml: string) => void;
  exportToToml: () => string;
  validate: () => { valid: boolean; errors: string[] };
  reset: () => void;

  // Settings
  setFrpcPath: (path: string) => void;
  setConfigPath: (path: string) => void;
  setAutoLaunch: (enabled: boolean) => void;
  setAutoLaunchWithFrpc: (enabled: boolean) => void;

  // Persistence
  loadFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<string | null>;
  setLastSavedPath: (path: string | null) => void;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('frpc-editor-settings');
    if (raw) {
      return JSON.parse(raw) as AppSettings;
    }
  } catch {
    // ignore
  }
  return { frpcPath: '', configPath: '', autoLaunch: false, autoLaunchWithFrpc: false };
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem('frpc-editor-settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function createInitialConfig(): FrpcConfig {
  return { ...defaultConfig };
}

const initialSettings = loadSettings();

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: createInitialConfig(),
  rawToml: generateToml(createInitialConfig()),
  isDirty: false,
  validationErrors: [],
  settings: initialSettings,
  lastSavedPath: null,
  isLoading: false,

  setConfig: (config) => {
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateField: (field, value) => {
    const config = { ...get().config, [field]: value };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateLog: (log) => {
    const config = { ...get().config, log };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateAuth: (auth) => {
    const config = { ...get().config, auth };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateWebServer: (webServer) => {
    const config = { ...get().config, webServer };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateTransport: (transport) => {
    const config = { ...get().config, transport };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateVirtualNet: (virtualNet) => {
    const config = { ...get().config, virtualNet };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateIncludes: (includes) => {
    const config = { ...get().config, includes };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  addProxy: (proxy) => {
    const proxies = [...(get().config.proxies || []), proxy];
    const config = { ...get().config, proxies };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateProxy: (index, proxy) => {
    const proxies = [...(get().config.proxies || [])];
    proxies[index] = proxy;
    const config = { ...get().config, proxies };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  removeProxy: (index) => {
    const proxies = (get().config.proxies || []).filter((_, i) => i !== index);
    const config = { ...get().config, proxies };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  moveProxy: (from, to) => {
    const proxies = [...(get().config.proxies || [])];
    const [moved] = proxies.splice(from, 1);
    proxies.splice(to, 0, moved);
    const config = { ...get().config, proxies };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  addVisitor: (visitor) => {
    const visitors = [...(get().config.visitors || []), visitor];
    const config = { ...get().config, visitors };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  updateVisitor: (index, visitor) => {
    const visitors = [...(get().config.visitors || [])];
    visitors[index] = visitor;
    const config = { ...get().config, visitors };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  removeVisitor: (index) => {
    const visitors = (get().config.visitors || []).filter((_, i) => i !== index);
    const config = { ...get().config, visitors };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  moveVisitor: (from, to) => {
    const visitors = [...(get().config.visitors || [])];
    const [moved] = visitors.splice(from, 1);
    visitors.splice(to, 0, moved);
    const config = { ...get().config, visitors };
    const rawToml = generateToml(config);
    const validation = validateToml(rawToml);
    set({ config, rawToml, isDirty: true, validationErrors: validation.errors });
  },

  loadFromToml: (toml) => {
    const config = parseToml(toml);
    const validation = validateToml(toml);
    set({ config, rawToml: toml, isDirty: true, validationErrors: validation.errors });
  },

  exportToToml: () => {
    return generateToml(get().config);
  },

  validate: () => {
    return validateToml(get().rawToml);
  },

  reset: () => {
    const config = createInitialConfig();
    const rawToml = generateToml(config);
    set({ config, rawToml, isDirty: false, validationErrors: [], lastSavedPath: null });
  },

  setFrpcPath: (path) => {
    const settings = { ...get().settings, frpcPath: path };
    saveSettings(settings);
    set({ settings });
  },

  setConfigPath: (path) => {
    const settings = { ...get().settings, configPath: path };
    saveSettings(settings);
    set({ settings });
  },

  setAutoLaunch: (enabled) => {
    const settings = { ...get().settings, autoLaunch: enabled };
    saveSettings(settings);
    set({ settings });
  },

  setAutoLaunchWithFrpc: (enabled) => {
    const settings = { ...get().settings, autoLaunchWithFrpc: enabled };
    saveSettings(settings);
    set({ settings });
  },

  setLastSavedPath: (path) => {
    set({ lastSavedPath: path });
  },

  loadFromDisk: async () => {
    set({ isLoading: true });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      // Pass user's configured configPath if set, otherwise null (backend uses exe_dir/frpc.toml)
      const userPath = get().settings.configPath || null;
      const content = await invoke<string>('load_app_config', { userPath });
      const resolvedPath = await invoke<string>('resolve_config_path', { userPath });

      if (content && content.trim().length > 0) {
        const config = parseToml(content);
        const validation = validateToml(content);
        set({
          config,
          rawToml: content,
          isDirty: false,
          validationErrors: validation.errors,
          lastSavedPath: resolvedPath,
        });
      } else {
        // No saved config yet, use default but remember the path
        const config = createInitialConfig();
        const rawToml = generateToml(config);
        set({
          config,
          rawToml,
          isDirty: false,
          validationErrors: [],
          lastSavedPath: resolvedPath,
        });
      }
    } catch (e) {
      console.warn('Failed to load app config:', e);
      // Fallback to default config
      const config = createInitialConfig();
      const rawToml = generateToml(config);
      set({ config, rawToml, isDirty: false, validationErrors: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  saveToDisk: async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const content = generateToml(get().config);
      const userPath = get().settings.configPath || null;
      const savedPath = await invoke<string>('save_app_config', { content, userPath });
      const validation = validateToml(content);
      set({
        rawToml: content,
        isDirty: false,
        validationErrors: validation.errors,
        lastSavedPath: savedPath,
      });
      return savedPath;
    } catch (e) {
      console.error('Failed to save app config:', e);
      return null;
    }
  },
}));
