// ========== frpc.toml 完整类型定义 ==========

export type ProxyType = 'tcp' | 'udp' | 'http' | 'https' | 'stcp' | 'sudp' | 'xtcp' | 'tcpmux';
export type VisitorType = 'stcp' | 'xtcp';
export type AuthMethod = 'token' | 'oidc';
export type Protocol = 'tcp' | 'kcp' | 'quic' | 'websocket' | 'wss';
export type WireProtocol = 'v1' | 'v2';
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
export type BandwidthLimitMode = 'client' | 'server';
export type HealthCheckType = 'tcp' | 'http';
export type ProxyProtocolVersion = 'v1' | 'v2';
export type MultiplexerType = 'httpconnect';
export type PluginType =
  | 'unix_domain_socket'
  | 'http_proxy'
  | 'socks5'
  | 'static_file'
  | 'https2http'
  | 'https2https'
  | 'http2https'
  | 'http2http'
  | 'tls2raw'
  | 'virtual_net';

// Log
export interface LogConfig {
  to?: string;
  level?: LogLevel;
  maxDays?: number;
  disablePrintColor?: boolean;
}

// Auth
export interface TokenSourceConfig {
  type?: 'file';
  file?: {
    path?: string;
  };
}

export interface OidcConfig {
  clientID?: string;
  clientSecret?: string;
  audience?: string;
  scope?: string;
  tokenEndpointURL?: string;
  additionalEndpointParams?: Record<string, string>;
  trustedCaFile?: string;
  insecureSkipVerify?: boolean;
  proxyURL?: string;
}

export interface AuthConfig {
  method?: AuthMethod;
  additionalScopes?: string[];
  token?: string;
  tokenSource?: TokenSourceConfig;
  oidc?: OidcConfig;
}

// WebServer
export interface WebServerConfig {
  addr?: string;
  port?: number;
  user?: string;
  password?: string;
  assetsDir?: string;
  pprofEnable?: boolean;
}

// Transport
export interface QuicConfig {
  keepalivePeriod?: number;
  maxIdleTimeout?: number;
  maxIncomingStreams?: number;
}

export interface TlsConfig {
  enable?: boolean;
  certFile?: string;
  keyFile?: string;
  trustedCaFile?: string;
  serverName?: string;
  disableCustomTLSFirstByte?: boolean;
}

export interface TransportConfig {
  dialServerTimeout?: number;
  dialServerKeepalive?: number;
  poolCount?: number;
  tcpMux?: boolean;
  tcpMuxKeepaliveInterval?: number;
  protocol?: Protocol;
  wireProtocol?: WireProtocol;
  connectServerLocalIP?: string;
  proxyURL?: string;
  quic?: QuicConfig;
  tls?: TlsConfig;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

// VirtualNet
export interface VirtualNetConfig {
  address?: string;
}

// Proxy Plugin
export interface ProxyPluginConfig {
  type?: PluginType;
  // unix_domain_socket
  unixPath?: string;
  // http_proxy, static_file
  httpUser?: string;
  httpPassword?: string;
  // socks5
  username?: string;
  password?: string;
  // static_file
  localPath?: string;
  stripPrefix?: string;
  // https2http, https2https, http2https, http2http, tls2raw
  localAddr?: string;
  crtPath?: string;
  keyPath?: string;
  hostHeaderRewrite?: string;
  requestHeaders?: {
    set?: Record<string, string>;
  };
  // virtual_net (visitor)
  destinationIP?: string;
}

// Proxy Transport
export interface ProxyTransportConfig {
  bandwidthLimit?: string;
  bandwidthLimitMode?: BandwidthLimitMode;
  useEncryption?: boolean;
  useCompression?: boolean;
  proxyProtocolVersion?: ProxyProtocolVersion;
}

// Proxy LoadBalancer
export interface ProxyLoadBalancerConfig {
  group?: string;
  groupKey?: string;
}

// HealthCheck Header
export interface HealthCheckHeader {
  name: string;
  value: string;
}

// Proxy HealthCheck
export interface ProxyHealthCheckConfig {
  type?: HealthCheckType;
  timeoutSeconds?: number;
  maxFailed?: number;
  intervalSeconds?: number;
  path?: string;
  httpHeaders?: HealthCheckHeader[];
}

// NAT Traversal
export interface NatTraversalConfig {
  disableAssistedAddrs?: boolean;
}

// Proxy
export interface ProxyConfig {
  name: string;
  type: ProxyType;
  enabled?: boolean;
  localIP?: string;
  localPort?: number;
  remotePort?: number;
  transport?: ProxyTransportConfig;
  loadBalancer?: ProxyLoadBalancerConfig;
  healthCheck?: ProxyHealthCheckConfig;
  metadatas?: Record<string, string>;
  annotations?: Record<string, string>;
  // http/https/tcpmux
  httpUser?: string;
  httpPassword?: string;
  subdomain?: string;
  customDomains?: string[];
  locations?: string[];
  routeByHTTPUser?: string;
  hostHeaderRewrite?: string;
  requestHeaders?: {
    set?: Record<string, string>;
  };
  responseHeaders?: {
    set?: Record<string, string>;
  };
  // stcp/sudp/xtcp
  secretKey?: string;
  allowUsers?: string[];
  // tcpmux
  multiplexer?: MultiplexerType;
  // xtcp
  natTraversal?: NatTraversalConfig;
  // plugin
  plugin?: ProxyPluginConfig;
}

// Visitor Plugin
export interface VisitorPluginConfig {
  type?: 'virtual_net';
  destinationIP?: string;
}

// Visitor
export interface VisitorConfig {
  name: string;
  type: VisitorType;
  serverName?: string;
  serverUser?: string;
  secretKey?: string;
  bindAddr?: string;
  bindPort?: number;
  // xtcp specific
  keepTunnelOpen?: boolean;
  maxRetriesAnHour?: number;
  minRetryInterval?: number;
  fallbackTo?: string;
  fallbackTimeoutMs?: number;
  natTraversal?: NatTraversalConfig;
  plugin?: VisitorPluginConfig;
}

// Main Config
export interface FrpcConfig {
  clientID?: string;
  user?: string;
  serverAddr?: string;
  serverPort?: number;
  natHoleStunServer?: string;
  loginFailExit?: boolean;
  dnsServer?: string;
  start?: string[];
  udpPacketSize?: number;
  featureGates?: Record<string, boolean>;
  metadatas?: Record<string, string>;
  includes?: string[];
  log?: LogConfig;
  auth?: AuthConfig;
  webServer?: WebServerConfig;
  transport?: TransportConfig;
  virtualNet?: VirtualNetConfig;
  proxies?: ProxyConfig[];
  visitors?: VisitorConfig[];
}

// 默认配置
export const defaultConfig: FrpcConfig = {
  serverAddr: '0.0.0.0',
  serverPort: 7000,
  loginFailExit: true,
  udpPacketSize: 1500,
  log: {
    to: './frpc.log',
    level: 'info',
    maxDays: 3,
    disablePrintColor: false,
  },
  auth: {
    method: 'token',
    token: '12345678',
  },
  webServer: {
    addr: '127.0.0.1',
    port: 7400,
    user: 'admin',
    password: 'admin',
    pprofEnable: false,
  },
  transport: {
    dialServerTimeout: 10,
    dialServerKeepalive: 7200,
    poolCount: 0,
    tcpMux: true,
    tcpMuxKeepaliveInterval: 30,
    protocol: 'tcp',
    wireProtocol: 'v1',
    connectServerLocalIP: '',
    tls: {
      enable: true,
      disableCustomTLSFirstByte: true,
    },
    heartbeatInterval: 10,
    heartbeatTimeout: 90,
  },
};
