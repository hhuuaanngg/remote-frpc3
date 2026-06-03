import * as toml from '@iarna/toml';
import type { FrpcConfig, ProxyConfig, VisitorConfig } from '@/types/frpc';
import { defaultConfig } from '@/types/frpc';

// ========== Parse TOML -> Config ==========

export function parseToml(tomlString: string): FrpcConfig {
  try {
    const parsed = toml.parse(tomlString);
    return normalizeConfig(parsed as Record<string, unknown>);
  } catch (e) {
    console.error('TOML parse error:', e);
    return { ...defaultConfig };
  }
}

function normalizeConfig(raw: Record<string, unknown>): FrpcConfig {
  const config: FrpcConfig = {};

  // Scalar fields
  if (raw.clientID !== undefined) config.clientID = String(raw.clientID);
  if (raw.user !== undefined) config.user = String(raw.user);
  if (raw.serverAddr !== undefined) config.serverAddr = String(raw.serverAddr);
  if (raw.serverPort !== undefined) config.serverPort = Number(raw.serverPort);
  if (raw.natHoleStunServer !== undefined) config.natHoleStunServer = String(raw.natHoleStunServer);
  if (raw.loginFailExit !== undefined) config.loginFailExit = Boolean(raw.loginFailExit);
  if (raw.dnsServer !== undefined) config.dnsServer = String(raw.dnsServer);
  if (raw.start !== undefined) config.start = Array.isArray(raw.start) ? raw.start.map(String) : [];
  if (raw.udpPacketSize !== undefined) config.udpPacketSize = Number(raw.udpPacketSize);
  if (raw.includes !== undefined) config.includes = Array.isArray(raw.includes) ? raw.includes.map(String) : [];

  // Maps
  if (raw.featureGates !== undefined) {
    config.featureGates = normalizeMap(raw.featureGates, v => Boolean(v));
  }
  if (raw.metadatas !== undefined) {
    config.metadatas = normalizeMap(raw.metadatas, v => String(v));
  }

  // Nested sections
  if (raw.log !== undefined) config.log = normalizeLog(raw.log as Record<string, unknown>);
  if (raw.auth !== undefined) config.auth = normalizeAuth(raw.auth as Record<string, unknown>);
  if (raw.webServer !== undefined) config.webServer = normalizeWebServer(raw.webServer as Record<string, unknown>);
  if (raw.transport !== undefined) config.transport = normalizeTransport(raw.transport as Record<string, unknown>);
  if (raw.virtualNet !== undefined) config.virtualNet = normalizeVirtualNet(raw.virtualNet as Record<string, unknown>);

  // Arrays
  if (raw.proxies !== undefined) {
    config.proxies = (Array.isArray(raw.proxies) ? raw.proxies : [raw.proxies]).map(normalizeProxy);
  }
  if (raw.visitors !== undefined) {
    config.visitors = (Array.isArray(raw.visitors) ? raw.visitors : [raw.visitors]).map(normalizeVisitor);
  }

  return config;
}

function normalizeMap<T>(raw: unknown, transform: (v: unknown) => T): Record<string, T> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(raw)) {
    result[key] = transform(value);
  }
  return result;
}

function normalizeLog(raw: Record<string, unknown>) {
  return {
    to: raw.to !== undefined ? String(raw.to) : undefined,
    level: raw.level !== undefined ? String(raw.level) as any : undefined,
    maxDays: raw.maxDays !== undefined ? Number(raw.maxDays) : undefined,
    disablePrintColor: raw.disablePrintColor !== undefined ? Boolean(raw.disablePrintColor) : undefined,
  };
}

function normalizeAuth(raw: Record<string, unknown>) {
  const auth: any = {
    method: raw.method !== undefined ? String(raw.method) as any : undefined,
  };
  if (raw.additionalScopes !== undefined) {
    auth.additionalScopes = Array.isArray(raw.additionalScopes) ? raw.additionalScopes.map(String) : [];
  }
  if (raw.token !== undefined) auth.token = String(raw.token);
  if (raw.tokenSource !== undefined) {
    const ts = raw.tokenSource as Record<string, unknown>;
    auth.tokenSource = {
      type: ts.type !== undefined ? String(ts.type) as any : undefined,
      file: ts.file !== undefined ? { path: String((ts.file as any).path) } : undefined,
    };
  }
  if (raw.oidc !== undefined) {
    const oidc = raw.oidc as Record<string, unknown>;
    auth.oidc = {
      clientID: oidc.clientID !== undefined ? String(oidc.clientID) : undefined,
      clientSecret: oidc.clientSecret !== undefined ? String(oidc.clientSecret) : undefined,
      audience: oidc.audience !== undefined ? String(oidc.audience) : undefined,
      scope: oidc.scope !== undefined ? String(oidc.scope) : undefined,
      tokenEndpointURL: oidc.tokenEndpointURL !== undefined ? String(oidc.tokenEndpointURL) : undefined,
      additionalEndpointParams: oidc.additionalEndpointParams !== undefined ? normalizeMap(oidc.additionalEndpointParams, v => String(v)) : undefined,
      trustedCaFile: oidc.trustedCaFile !== undefined ? String(oidc.trustedCaFile) : undefined,
      insecureSkipVerify: oidc.insecureSkipVerify !== undefined ? Boolean(oidc.insecureSkipVerify) : undefined,
      proxyURL: oidc.proxyURL !== undefined ? String(oidc.proxyURL) : undefined,
    };
  }
  return auth;
}

function normalizeWebServer(raw: Record<string, unknown>) {
  return {
    addr: raw.addr !== undefined ? String(raw.addr) : undefined,
    port: raw.port !== undefined ? Number(raw.port) : undefined,
    user: raw.user !== undefined ? String(raw.user) : undefined,
    password: raw.password !== undefined ? String(raw.password) : undefined,
    assetsDir: raw.assetsDir !== undefined ? String(raw.assetsDir) : undefined,
    pprofEnable: raw.pprofEnable !== undefined ? Boolean(raw.pprofEnable) : undefined,
  };
}

function normalizeTransport(raw: Record<string, unknown>) {
  const t: any = {};
  if (raw.dialServerTimeout !== undefined) t.dialServerTimeout = Number(raw.dialServerTimeout);
  if (raw.dialServerKeepalive !== undefined) t.dialServerKeepalive = Number(raw.dialServerKeepalive);
  if (raw.poolCount !== undefined) t.poolCount = Number(raw.poolCount);
  if (raw.tcpMux !== undefined) t.tcpMux = Boolean(raw.tcpMux);
  if (raw.tcpMuxKeepaliveInterval !== undefined) t.tcpMuxKeepaliveInterval = Number(raw.tcpMuxKeepaliveInterval);
  if (raw.protocol !== undefined) t.protocol = String(raw.protocol) as any;
  if (raw.wireProtocol !== undefined) t.wireProtocol = String(raw.wireProtocol) as any;
  if (raw.connectServerLocalIP !== undefined) t.connectServerLocalIP = String(raw.connectServerLocalIP);
  if (raw.proxyURL !== undefined) t.proxyURL = String(raw.proxyURL);
  if (raw.quic !== undefined) {
    const q = raw.quic as Record<string, unknown>;
    t.quic = {
      keepalivePeriod: q.keepalivePeriod !== undefined ? Number(q.keepalivePeriod) : undefined,
      maxIdleTimeout: q.maxIdleTimeout !== undefined ? Number(q.maxIdleTimeout) : undefined,
      maxIncomingStreams: q.maxIncomingStreams !== undefined ? Number(q.maxIncomingStreams) : undefined,
    };
  }
  if (raw.tls !== undefined) {
    const tls = raw.tls as Record<string, unknown>;
    t.tls = {
      enable: tls.enable !== undefined ? Boolean(tls.enable) : undefined,
      certFile: tls.certFile !== undefined ? String(tls.certFile) : undefined,
      keyFile: tls.keyFile !== undefined ? String(tls.keyFile) : undefined,
      trustedCaFile: tls.trustedCaFile !== undefined ? String(tls.trustedCaFile) : undefined,
      serverName: tls.serverName !== undefined ? String(tls.serverName) : undefined,
      disableCustomTLSFirstByte: tls.disableCustomTLSFirstByte !== undefined ? Boolean(tls.disableCustomTLSFirstByte) : undefined,
    };
  }
  if (raw.heartbeatInterval !== undefined) t.heartbeatInterval = Number(raw.heartbeatInterval);
  if (raw.heartbeatTimeout !== undefined) t.heartbeatTimeout = Number(raw.heartbeatTimeout);
  return t;
}

function normalizeVirtualNet(raw: Record<string, unknown>) {
  return {
    address: raw.address !== undefined ? String(raw.address) : undefined,
  };
}

function normalizeProxy(raw: Record<string, unknown>): ProxyConfig {
  const p: ProxyConfig = {
    name: String(raw.name || ''),
    type: (raw.type as any) || 'tcp',
  };

  if (raw.enabled !== undefined) p.enabled = Boolean(raw.enabled);
  if (raw.localIP !== undefined) p.localIP = String(raw.localIP);
  if (raw.localPort !== undefined) p.localPort = Number(raw.localPort);
  if (raw.remotePort !== undefined) p.remotePort = Number(raw.remotePort);

  // Transport
  if (raw.transport !== undefined) {
    const t = raw.transport as Record<string, unknown>;
    p.transport = {
      bandwidthLimit: t.bandwidthLimit !== undefined ? String(t.bandwidthLimit) : undefined,
      bandwidthLimitMode: t.bandwidthLimitMode !== undefined ? String(t.bandwidthLimitMode) as any : undefined,
      useEncryption: t.useEncryption !== undefined ? Boolean(t.useEncryption) : undefined,
      useCompression: t.useCompression !== undefined ? Boolean(t.useCompression) : undefined,
      proxyProtocolVersion: t.proxyProtocolVersion !== undefined ? String(t.proxyProtocolVersion) as any : undefined,
    };
  }

  // LoadBalancer
  if (raw.loadBalancer !== undefined) {
    const lb = raw.loadBalancer as Record<string, unknown>;
    p.loadBalancer = {
      group: lb.group !== undefined ? String(lb.group) : undefined,
      groupKey: lb.groupKey !== undefined ? String(lb.groupKey) : undefined,
    };
  }

  // HealthCheck
  if (raw.healthCheck !== undefined) {
    const hc = raw.healthCheck as Record<string, unknown>;
    p.healthCheck = {
      type: hc.type !== undefined ? String(hc.type) as any : undefined,
      timeoutSeconds: hc.timeoutSeconds !== undefined ? Number(hc.timeoutSeconds) : undefined,
      maxFailed: hc.maxFailed !== undefined ? Number(hc.maxFailed) : undefined,
      intervalSeconds: hc.intervalSeconds !== undefined ? Number(hc.intervalSeconds) : undefined,
      path: hc.path !== undefined ? String(hc.path) : undefined,
      httpHeaders: hc.httpHeaders !== undefined ? Array.isArray(hc.httpHeaders) ? hc.httpHeaders.map((h: any) => ({ name: String(h.name), value: String(h.value) })) : [] : undefined,
    };
  }

  // Metadata & Annotations
  if (raw.metadatas !== undefined) p.metadatas = normalizeMap(raw.metadatas, v => String(v));
  if (raw.annotations !== undefined) p.annotations = normalizeMap(raw.annotations, v => String(v));

  // HTTP/HTTPS
  if (raw.httpUser !== undefined) p.httpUser = String(raw.httpUser);
  if (raw.httpPassword !== undefined) p.httpPassword = String(raw.httpPassword);
  if (raw.subdomain !== undefined) p.subdomain = String(raw.subdomain);
  if (raw.customDomains !== undefined) p.customDomains = Array.isArray(raw.customDomains) ? raw.customDomains.map(String) : [];
  if (raw.locations !== undefined) p.locations = Array.isArray(raw.locations) ? raw.locations.map(String) : [];
  if (raw.routeByHTTPUser !== undefined) p.routeByHTTPUser = String(raw.routeByHTTPUser);
  if (raw.hostHeaderRewrite !== undefined) p.hostHeaderRewrite = String(raw.hostHeaderRewrite);
  if (raw.requestHeaders !== undefined) {
    const rh = raw.requestHeaders as Record<string, unknown>;
    p.requestHeaders = { set: rh.set !== undefined ? normalizeMap(rh.set, v => String(v)) : undefined };
  }
  if (raw.responseHeaders !== undefined) {
    const rh = raw.responseHeaders as Record<string, unknown>;
    p.responseHeaders = { set: rh.set !== undefined ? normalizeMap(rh.set, v => String(v)) : undefined };
  }

  // STCP/SUDP/XTCP
  if (raw.secretKey !== undefined) p.secretKey = String(raw.secretKey);
  if (raw.allowUsers !== undefined) p.allowUsers = Array.isArray(raw.allowUsers) ? raw.allowUsers.map(String) : [];

  // TCPMUX
  if (raw.multiplexer !== undefined) p.multiplexer = String(raw.multiplexer) as any;

  // NAT Traversal
  if (raw.natTraversal !== undefined) {
    const nt = raw.natTraversal as Record<string, unknown>;
    p.natTraversal = { disableAssistedAddrs: nt.disableAssistedAddrs !== undefined ? Boolean(nt.disableAssistedAddrs) : undefined };
  }

  // Plugin
  if (raw.plugin !== undefined) {
    const pl = raw.plugin as Record<string, unknown>;
    p.plugin = {
      type: pl.type !== undefined ? String(pl.type) as any : undefined,
      unixPath: pl.unixPath !== undefined ? String(pl.unixPath) : undefined,
      httpUser: pl.httpUser !== undefined ? String(pl.httpUser) : undefined,
      httpPassword: pl.httpPassword !== undefined ? String(pl.httpPassword) : undefined,
      username: pl.username !== undefined ? String(pl.username) : undefined,
      password: pl.password !== undefined ? String(pl.password) : undefined,
      localPath: pl.localPath !== undefined ? String(pl.localPath) : undefined,
      stripPrefix: pl.stripPrefix !== undefined ? String(pl.stripPrefix) : undefined,
      localAddr: pl.localAddr !== undefined ? String(pl.localAddr) : undefined,
      crtPath: pl.crtPath !== undefined ? String(pl.crtPath) : undefined,
      keyPath: pl.keyPath !== undefined ? String(pl.keyPath) : undefined,
      hostHeaderRewrite: pl.hostHeaderRewrite !== undefined ? String(pl.hostHeaderRewrite) : undefined,
      requestHeaders: pl.requestHeaders !== undefined ? { set: normalizeMap((pl.requestHeaders as any).set, v => String(v)) } : undefined,
      destinationIP: pl.destinationIP !== undefined ? String(pl.destinationIP) : undefined,
    };
  }

  return p;
}

function normalizeVisitor(raw: Record<string, unknown>): VisitorConfig {
  const v: VisitorConfig = {
    name: String(raw.name || ''),
    type: (raw.type as any) || 'stcp',
  };

  if (raw.serverName !== undefined) v.serverName = String(raw.serverName);
  if (raw.serverUser !== undefined) v.serverUser = String(raw.serverUser);
  if (raw.secretKey !== undefined) v.secretKey = String(raw.secretKey);
  if (raw.bindAddr !== undefined) v.bindAddr = String(raw.bindAddr);
  if (raw.bindPort !== undefined) v.bindPort = Number(raw.bindPort);
  if (raw.keepTunnelOpen !== undefined) v.keepTunnelOpen = Boolean(raw.keepTunnelOpen);
  if (raw.maxRetriesAnHour !== undefined) v.maxRetriesAnHour = Number(raw.maxRetriesAnHour);
  if (raw.minRetryInterval !== undefined) v.minRetryInterval = Number(raw.minRetryInterval);
  if (raw.fallbackTo !== undefined) v.fallbackTo = String(raw.fallbackTo);
  if (raw.fallbackTimeoutMs !== undefined) v.fallbackTimeoutMs = Number(raw.fallbackTimeoutMs);

  if (raw.natTraversal !== undefined) {
    const nt = raw.natTraversal as Record<string, unknown>;
    v.natTraversal = { disableAssistedAddrs: nt.disableAssistedAddrs !== undefined ? Boolean(nt.disableAssistedAddrs) : undefined };
  }

  if (raw.plugin !== undefined) {
    const pl = raw.plugin as Record<string, unknown>;
    v.plugin = {
      type: pl.type !== undefined ? String(pl.type) as any : undefined,
      destinationIP: pl.destinationIP !== undefined ? String(pl.destinationIP) : undefined,
    };
  }

  return v;
}

// ========== Config -> TOML ==========

export function generateToml(config: FrpcConfig): string {
  const lines: string[] = [];

  // Header comment
  lines.push('# frpc.toml - Generated by frpc-editor');
  lines.push('');

  // Global config
  if (config.clientID) lines.push(`clientID = ${quote(config.clientID)}`);
  if (config.user) lines.push(`user = ${quote(config.user)}`);
  if (config.serverAddr !== undefined) lines.push(`serverAddr = ${quote(config.serverAddr)}`);
  if (config.serverPort !== undefined) lines.push(`serverPort = ${config.serverPort}`);
  if (config.natHoleStunServer) lines.push(`natHoleStunServer = ${quote(config.natHoleStunServer)}`);
  if (config.loginFailExit !== undefined) lines.push(`loginFailExit = ${config.loginFailExit}`);
  if (config.dnsServer) lines.push(`dnsServer = ${quote(config.dnsServer)}`);
  if (config.start && config.start.length > 0) lines.push(`start = ${JSON.stringify(config.start)}`);
  if (config.udpPacketSize !== undefined) lines.push(`udpPacketSize = ${config.udpPacketSize}`);

  // featureGates
  if (config.featureGates && Object.keys(config.featureGates).length > 0) {
    lines.push('');
    lines.push('# Feature gates');
    lines.push(`featureGates = ${JSON.stringify(config.featureGates).replace(/"/g, '').replace(/:/g, ' =').replace(/,/g, ', ')}`);
  }

  // metadatas
  if (config.metadatas && Object.keys(config.metadatas).length > 0) {
    lines.push('');
    lines.push('# Additional metadatas');
    for (const [key, value] of Object.entries(config.metadatas)) {
      lines.push(`metadatas.${key} = ${quote(value)}`);
    }
  }

  // includes
  if (config.includes && config.includes.length > 0) {
    lines.push('');
    lines.push(`includes = ${JSON.stringify(config.includes)}`);
  }

  // log
  if (config.log) {
    lines.push('');
    lines.push('# Log configuration');
    if (config.log.to !== undefined) lines.push(`log.to = ${quote(config.log.to)}`);
    if (config.log.level) lines.push(`log.level = ${quote(config.log.level)}`);
    if (config.log.maxDays !== undefined) lines.push(`log.maxDays = ${config.log.maxDays}`);
    if (config.log.disablePrintColor !== undefined) lines.push(`log.disablePrintColor = ${config.log.disablePrintColor}`);
  }

  // auth
  if (config.auth) {
    lines.push('');
    lines.push('# Authentication');
    if (config.auth.method) lines.push(`auth.method = ${quote(config.auth.method)}`);
    if (config.auth.additionalScopes && config.auth.additionalScopes.length > 0) {
      lines.push(`auth.additionalScopes = ${JSON.stringify(config.auth.additionalScopes)}`);
    }
    if (config.auth.token) lines.push(`auth.token = ${quote(config.auth.token)}`);
    if (config.auth.tokenSource) {
      if (config.auth.tokenSource.type) lines.push(`auth.tokenSource.type = ${quote(config.auth.tokenSource.type)}`);
      if (config.auth.tokenSource.file?.path) lines.push(`auth.tokenSource.file.path = ${quote(config.auth.tokenSource.file.path)}`);
    }
    if (config.auth.oidc) {
      const oidc = config.auth.oidc;
      if (oidc.clientID) lines.push(`auth.oidc.clientID = ${quote(oidc.clientID)}`);
      if (oidc.clientSecret) lines.push(`auth.oidc.clientSecret = ${quote(oidc.clientSecret)}`);
      if (oidc.audience) lines.push(`auth.oidc.audience = ${quote(oidc.audience)}`);
      if (oidc.scope !== undefined) lines.push(`auth.oidc.scope = ${quote(oidc.scope)}`);
      if (oidc.tokenEndpointURL) lines.push(`auth.oidc.tokenEndpointURL = ${quote(oidc.tokenEndpointURL)}`);
      if (oidc.additionalEndpointParams) {
        for (const [key, value] of Object.entries(oidc.additionalEndpointParams)) {
          lines.push(`auth.oidc.additionalEndpointParams.${key} = ${quote(value)}`);
        }
      }
      if (oidc.trustedCaFile) lines.push(`auth.oidc.trustedCaFile = ${quote(oidc.trustedCaFile)}`);
      if (oidc.insecureSkipVerify !== undefined) lines.push(`auth.oidc.insecureSkipVerify = ${oidc.insecureSkipVerify}`);
      if (oidc.proxyURL) lines.push(`auth.oidc.proxyURL = ${quote(oidc.proxyURL)}`);
    }
  }

  // webServer
  if (config.webServer) {
    lines.push('');
    lines.push('# Web Server configuration');
    if (config.webServer.addr !== undefined) lines.push(`webServer.addr = ${quote(config.webServer.addr)}`);
    if (config.webServer.port !== undefined) lines.push(`webServer.port = ${config.webServer.port}`);
    if (config.webServer.user !== undefined) lines.push(`webServer.user = ${quote(config.webServer.user)}`);
    if (config.webServer.password !== undefined) lines.push(`webServer.password = ${quote(config.webServer.password)}`);
    if (config.webServer.assetsDir) lines.push(`webServer.assetsDir = ${quote(config.webServer.assetsDir)}`);
    if (config.webServer.pprofEnable !== undefined) lines.push(`webServer.pprofEnable = ${config.webServer.pprofEnable}`);
  }

  // transport
  if (config.transport) {
    lines.push('');
    lines.push('# Transport configuration');
    const t = config.transport;
    if (t.dialServerTimeout !== undefined) lines.push(`transport.dialServerTimeout = ${t.dialServerTimeout}`);
    if (t.dialServerKeepalive !== undefined) lines.push(`transport.dialServerKeepalive = ${t.dialServerKeepalive}`);
    if (t.poolCount !== undefined) lines.push(`transport.poolCount = ${t.poolCount}`);
    if (t.tcpMux !== undefined) lines.push(`transport.tcpMux = ${t.tcpMux}`);
    if (t.tcpMuxKeepaliveInterval !== undefined) lines.push(`transport.tcpMuxKeepaliveInterval = ${t.tcpMuxKeepaliveInterval}`);
    if (t.protocol) lines.push(`transport.protocol = ${quote(t.protocol)}`);
    if (t.wireProtocol) lines.push(`transport.wireProtocol = ${quote(t.wireProtocol)}`);
    if (t.connectServerLocalIP !== undefined) lines.push(`transport.connectServerLocalIP = ${quote(t.connectServerLocalIP)}`);
    if (t.proxyURL) lines.push(`transport.proxyURL = ${quote(t.proxyURL)}`);

    if (t.quic) {
      if (t.quic.keepalivePeriod !== undefined) lines.push(`transport.quic.keepalivePeriod = ${t.quic.keepalivePeriod}`);
      if (t.quic.maxIdleTimeout !== undefined) lines.push(`transport.quic.maxIdleTimeout = ${t.quic.maxIdleTimeout}`);
      if (t.quic.maxIncomingStreams !== undefined) lines.push(`transport.quic.maxIncomingStreams = ${t.quic.maxIncomingStreams}`);
    }

    if (t.tls) {
      if (t.tls.enable !== undefined) lines.push(`transport.tls.enable = ${t.tls.enable}`);
      if (t.tls.certFile) lines.push(`transport.tls.certFile = ${quote(t.tls.certFile)}`);
      if (t.tls.keyFile) lines.push(`transport.tls.keyFile = ${quote(t.tls.keyFile)}`);
      if (t.tls.trustedCaFile) lines.push(`transport.tls.trustedCaFile = ${quote(t.tls.trustedCaFile)}`);
      if (t.tls.serverName) lines.push(`transport.tls.serverName = ${quote(t.tls.serverName)}`);
      if (t.tls.disableCustomTLSFirstByte !== undefined) lines.push(`transport.tls.disableCustomTLSFirstByte = ${t.tls.disableCustomTLSFirstByte}`);
    }

    if (t.heartbeatInterval !== undefined) lines.push(`transport.heartbeatInterval = ${t.heartbeatInterval}`);
    if (t.heartbeatTimeout !== undefined) lines.push(`transport.heartbeatTimeout = ${t.heartbeatTimeout}`);
  }

  // virtualNet
  if (config.virtualNet?.address) {
    lines.push('');
    lines.push('# Virtual Network');
    lines.push(`virtualNet.address = ${quote(config.virtualNet.address)}`);
  }

  // Proxies
  if (config.proxies && config.proxies.length > 0) {
    for (const proxy of config.proxies) {
      lines.push('');
      lines.push('[[proxies]]');
      lines.push(`name = ${quote(proxy.name)}`);
      lines.push(`type = ${quote(proxy.type)}`);
      if (proxy.enabled !== undefined && proxy.enabled !== true) lines.push(`enabled = ${proxy.enabled}`);
      if (proxy.localIP) lines.push(`localIP = ${quote(proxy.localIP)}`);
      if (proxy.localPort !== undefined) lines.push(`localPort = ${proxy.localPort}`);
      if (proxy.remotePort !== undefined) lines.push(`remotePort = ${proxy.remotePort}`);

      // Transport
      if (proxy.transport) {
        const pt = proxy.transport;
        if (pt.bandwidthLimit) lines.push(`transport.bandwidthLimit = ${quote(pt.bandwidthLimit)}`);
        if (pt.bandwidthLimitMode) lines.push(`transport.bandwidthLimitMode = ${quote(pt.bandwidthLimitMode)}`);
        if (pt.useEncryption !== undefined) lines.push(`transport.useEncryption = ${pt.useEncryption}`);
        if (pt.useCompression !== undefined) lines.push(`transport.useCompression = ${pt.useCompression}`);
        if (pt.proxyProtocolVersion) lines.push(`transport.proxyProtocolVersion = ${quote(pt.proxyProtocolVersion)}`);
      }

      // LoadBalancer
      if (proxy.loadBalancer) {
        if (proxy.loadBalancer.group) lines.push(`loadBalancer.group = ${quote(proxy.loadBalancer.group)}`);
        if (proxy.loadBalancer.groupKey) lines.push(`loadBalancer.groupKey = ${quote(proxy.loadBalancer.groupKey)}`);
      }

      // HealthCheck
      if (proxy.healthCheck) {
        const hc = proxy.healthCheck;
        if (hc.type) lines.push(`healthCheck.type = ${quote(hc.type)}`);
        if (hc.timeoutSeconds !== undefined) lines.push(`healthCheck.timeoutSeconds = ${hc.timeoutSeconds}`);
        if (hc.maxFailed !== undefined) lines.push(`healthCheck.maxFailed = ${hc.maxFailed}`);
        if (hc.intervalSeconds !== undefined) lines.push(`healthCheck.intervalSeconds = ${hc.intervalSeconds}`);
        if (hc.path) lines.push(`healthCheck.path = ${quote(hc.path)}`);
        if (hc.httpHeaders && hc.httpHeaders.length > 0) {
          const headers = hc.httpHeaders.map(h => `{ name = ${quote(h.name)}, value = ${quote(h.value)} }`).join(', ');
          lines.push(`healthCheck.httpHeaders = [ ${headers} ]`);
        }
      }

      // Metadatas & Annotations
      if (proxy.metadatas) {
        for (const [key, value] of Object.entries(proxy.metadatas)) {
          lines.push(`metadatas.${key} = ${quote(value)}`);
        }
      }
      if (proxy.annotations) {
        lines.push('[proxies.annotations]');
        for (const [key, value] of Object.entries(proxy.annotations)) {
          lines.push(`${key} = ${quote(value)}`);
        }
      }

      // HTTP/HTTPS specific
      if (proxy.httpUser) lines.push(`httpUser = ${quote(proxy.httpUser)}`);
      if (proxy.httpPassword) lines.push(`httpPassword = ${quote(proxy.httpPassword)}`);
      if (proxy.subdomain) lines.push(`subdomain = ${quote(proxy.subdomain)}`);
      if (proxy.customDomains && proxy.customDomains.length > 0) lines.push(`customDomains = ${JSON.stringify(proxy.customDomains)}`);
      if (proxy.locations && proxy.locations.length > 0) lines.push(`locations = ${JSON.stringify(proxy.locations)}`);
      if (proxy.routeByHTTPUser) lines.push(`routeByHTTPUser = ${quote(proxy.routeByHTTPUser)}`);
      if (proxy.hostHeaderRewrite) lines.push(`hostHeaderRewrite = ${quote(proxy.hostHeaderRewrite)}`);
      if (proxy.requestHeaders?.set && Object.keys(proxy.requestHeaders.set).length > 0) {
        for (const [key, value] of Object.entries(proxy.requestHeaders.set)) {
          lines.push(`requestHeaders.set.${key} = ${quote(value)}`);
        }
      }
      if (proxy.responseHeaders?.set && Object.keys(proxy.responseHeaders.set).length > 0) {
        for (const [key, value] of Object.entries(proxy.responseHeaders.set)) {
          lines.push(`responseHeaders.set.${key} = ${quote(value)}`);
        }
      }

      // STCP/SUDP/XTCP
      if (proxy.secretKey) lines.push(`secretKey = ${quote(proxy.secretKey)}`);
      if (proxy.allowUsers && proxy.allowUsers.length > 0) lines.push(`allowUsers = ${JSON.stringify(proxy.allowUsers)}`);

      // TCPMUX
      if (proxy.multiplexer) lines.push(`multiplexer = ${quote(proxy.multiplexer)}`);

      // NAT Traversal
      if (proxy.natTraversal?.disableAssistedAddrs !== undefined) {
        lines.push('[proxies.natTraversal]');
        lines.push(`disableAssistedAddrs = ${proxy.natTraversal.disableAssistedAddrs}`);
      }

      // Plugin
      if (proxy.plugin) {
        lines.push('[proxies.plugin]');
        const pl = proxy.plugin;
        if (pl.type) lines.push(`type = ${quote(pl.type)}`);
        if (pl.unixPath) lines.push(`unixPath = ${quote(pl.unixPath)}`);
        if (pl.httpUser) lines.push(`httpUser = ${quote(pl.httpUser)}`);
        if (pl.httpPassword) lines.push(`httpPassword = ${quote(pl.httpPassword)}`);
        if (pl.username) lines.push(`username = ${quote(pl.username)}`);
        if (pl.password) lines.push(`password = ${quote(pl.password)}`);
        if (pl.localPath) lines.push(`localPath = ${quote(pl.localPath)}`);
        if (pl.stripPrefix) lines.push(`stripPrefix = ${quote(pl.stripPrefix)}`);
        if (pl.localAddr) lines.push(`localAddr = ${quote(pl.localAddr)}`);
        if (pl.crtPath) lines.push(`crtPath = ${quote(pl.crtPath)}`);
        if (pl.keyPath) lines.push(`keyPath = ${quote(pl.keyPath)}`);
        if (pl.hostHeaderRewrite) lines.push(`hostHeaderRewrite = ${quote(pl.hostHeaderRewrite)}`);
        if (pl.requestHeaders?.set) {
          for (const [key, value] of Object.entries(pl.requestHeaders.set)) {
            lines.push(`requestHeaders.set.${key} = ${quote(value)}`);
          }
        }
        if (pl.destinationIP) lines.push(`destinationIP = ${quote(pl.destinationIP)}`);
      }
    }
  }

  // Visitors
  if (config.visitors && config.visitors.length > 0) {
    for (const visitor of config.visitors) {
      lines.push('');
      lines.push('[[visitors]]');
      lines.push(`name = ${quote(visitor.name)}`);
      lines.push(`type = ${quote(visitor.type)}`);
      if (visitor.serverName) lines.push(`serverName = ${quote(visitor.serverName)}`);
      if (visitor.serverUser) lines.push(`serverUser = ${quote(visitor.serverUser)}`);
      if (visitor.secretKey) lines.push(`secretKey = ${quote(visitor.secretKey)}`);
      if (visitor.bindAddr) lines.push(`bindAddr = ${quote(visitor.bindAddr)}`);
      if (visitor.bindPort !== undefined) lines.push(`bindPort = ${visitor.bindPort}`);

      // XTCP specific
      if (visitor.keepTunnelOpen !== undefined) lines.push(`keepTunnelOpen = ${visitor.keepTunnelOpen}`);
      if (visitor.maxRetriesAnHour !== undefined) lines.push(`maxRetriesAnHour = ${visitor.maxRetriesAnHour}`);
      if (visitor.minRetryInterval !== undefined) lines.push(`minRetryInterval = ${visitor.minRetryInterval}`);
      if (visitor.fallbackTo) lines.push(`fallbackTo = ${quote(visitor.fallbackTo)}`);
      if (visitor.fallbackTimeoutMs !== undefined) lines.push(`fallbackTimeoutMs = ${visitor.fallbackTimeoutMs}`);

      // NAT Traversal
      if (visitor.natTraversal?.disableAssistedAddrs !== undefined) {
        lines.push('[visitors.natTraversal]');
        lines.push(`disableAssistedAddrs = ${visitor.natTraversal.disableAssistedAddrs}`);
      }

      // Plugin
      if (visitor.plugin) {
        lines.push('[visitors.plugin]');
        if (visitor.plugin.type) lines.push(`type = ${quote(visitor.plugin.type)}`);
        if (visitor.plugin.destinationIP) lines.push(`destinationIP = ${quote(visitor.plugin.destinationIP)}`);
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

function quote(str: string): string {
  if (str.includes('\n') || str.includes('"')) {
    return '"""' + str + '"""';
  }
  if (str.includes(' ') || str.includes('=') || str.includes('#') || str.includes('[') || str.includes(']') || str.includes('{') || str.includes('}') || str.includes(',')) {
    return `"${str}"`;
  }
  if (str === '' || /^(true|false|null|\d+)$/.test(str)) {
    return `"${str}"`;
  }
  return `"${str}"`;
}

// ========== Validate TOML ==========

export function validateToml(tomlString: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const parsed = toml.parse(tomlString);
    const config = normalizeConfig(parsed as Record<string, unknown>);

    // Basic validation
    if (!config.serverAddr) {
      errors.push('serverAddr is required');
    }
    if (config.serverPort === undefined) {
      errors.push('serverPort is required');
    }

    // Validate proxies
    if (config.proxies) {
      for (let i = 0; i < config.proxies.length; i++) {
        const p = config.proxies[i];
        if (!p.name) errors.push(`Proxy #${i + 1}: name is required`);
        if (!p.type) errors.push(`Proxy "${p.name || `#${i + 1}`}": type is required`);
      }
    }

    // Validate visitors
    if (config.visitors) {
      for (let i = 0; i < config.visitors.length; i++) {
        const v = config.visitors[i];
        if (!v.name) errors.push(`Visitor #${i + 1}: name is required`);
        if (!v.type) errors.push(`Visitor "${v.name || `#${i + 1}`}": type is required`);
      }
    }

  } catch (e) {
    errors.push(`TOML parse error: ${e}`);
  }

  return { valid: errors.length === 0, errors };
}
