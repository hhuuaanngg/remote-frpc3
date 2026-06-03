/**
 * frp 官方文档参数说明
 * 来源：gofrp.org 中文文档 + GitHub frpc_full_example.toml 注释
 */

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  // ========== 全局配置 ==========
  serverAddr:
    "连接 frps 服务端的地址。IPv6 地址需用方括号包裹，如 [::1]。",
  serverPort:
    "连接 frps 服务端的端口。默认值 7000。",
  clientID:
    "此 frpc 实例的可选唯一标识符。",
  user:
    "用户名，设置此参数后，代理名称会被修改为 {user}.{proxyName} 格式。",
  natHoleStunServer:
    "xtcp 打洞所需的 STUN 服务器地址。默认值 stun.easyvoip.com:3478。",
  loginFailExit:
    "第一次登录失败后是否退出程序。默认 true（退出）。设置为 false 会持续重试。",
  dnsServer:
    "使用指定的 DNS 服务器地址，覆盖系统默认配置。",
  udpPacketSize:
    "代理 UDP 服务时支持的最大包长度（字节）。默认值 1500。",
  start:
    "指定启用部分代理名称列表。全局允许列表，配置和 store 合并后生效。未列出的代理不会启动。",
  featureGates:
    "特性门控，用于启用或禁用实验性功能。例如 { VirtualNet = true }。",
  virtualNetAddress:
    "虚拟网络接口的 IP 地址和网段，格式为 CIDR（如 192.168.1.1/24）。需要启用 VirtualNet 特性门控。",
  metadatas:
    "客户端附加元数据键值对，会传递给服务端插件。",
  includes:
    "指定额外的配置文件目录或文件路径，支持通配符，如 ./confd/*.ini。",

  // ========== 认证配置 ==========
  "auth.method":
    "鉴权方式。可选值为 token 或 oidc。默认 token。",
  "auth.additionalScopes":
    "鉴权信息附加范围。可选值为 HeartBeats 和 NewWorkConns。",
  "auth.token":
    "在 method 为 token 时生效的认证令牌。与 tokenSource 互斥。",
  "auth.tokenSource":
    "从外部来源动态获取 token 的配置。与 auth.token 字段互斥。",
  "auth.tokenSource.type":
    "token 来源类型。例如 file 表示从文件加载。",
  "auth.tokenSource.file.path":
    "token 文件的路径。",
  "auth.oidc.clientID":
    "OIDC 客户端 ID。",
  "auth.oidc.clientSecret":
    "OIDC 客户端密钥。",
  "auth.oidc.audience":
    "OIDC audience 参数。",
  "auth.oidc.scope":
    "OIDC scope 参数。默认为空。",
  "auth.oidc.tokenEndpointURL":
    "OIDC 令牌端点 URL。",
  "auth.oidc.additionalEndpointParams":
    "OIDC 令牌端点的附加参数。",
  "auth.oidc.trustedCaFile":
    "信任的 CA 证书文件路径，用于验证 OIDC 服务端 TLS 证书。",
  "auth.oidc.insecureSkipVerify":
    "跳过 TLS 证书验证。不推荐在生产环境使用，仅用于调试。",
  "auth.oidc.proxyURL":
    "访问 OIDC 令牌端点时使用的代理服务器 URL。支持 http, https, socks5, socks5h。",

  // ========== 传输配置 ==========
  "transport.dialServerTimeout":
    "连接服务端的超时时间（秒）。默认值 10。",
  "transport.dialServerKeepalive":
    "和服务端底层 TCP 连接的 keepalive 间隔时间（秒）。负值禁用。",
  "transport.poolCount":
    "预建立连接池大小。默认值 0。",
  "transport.tcpMux":
    "TCP 流多路复用，默认启用。建议保持开启以减少连接数。",
  "transport.tcpMuxKeepaliveInterval":
    "tcpMux 的心跳检查间隔时间（秒）。",
  "transport.protocol":
    "和 frps 之间的通信协议。可选值为 tcp, kcp, quic, websocket, wss。默认 tcp。",
  "transport.wireProtocol":
    "FRP 内部协议版本。可选值为 v1 和 v2。默认 v1。",
  "transport.connectServerLocalIP":
    "连接服务端时所绑定的本地 IP。仅在 protocol 为 tcp 或 websocket 时生效。",
  "transport.proxyURL":
    "连接服务端使用的代理地址。支持 http, socks5, ntlm 格式。仅在 protocol 为 tcp 时生效。",
  "transport.quic.keepalivePeriod":
    "QUIC 保活周期（秒）。",
  "transport.quic.maxIdleTimeout":
    "QUIC 空闲超时时间（秒）。",
  "transport.quic.maxIncomingStreams":
    "QUIC 最大入站流数。",
  "transport.tls.enable":
    "是否和服务端之间启用 TLS 连接。v0.50+ 默认值已改为 true。",
  "transport.tls.certFile":
    "客户端证书文件路径。",
  "transport.tls.keyFile":
    "客户端密钥文件路径。",
  "transport.tls.trustedCaFile":
    "受信任的 CA 证书文件路径。",
  "transport.tls.serverName":
    "TLS 服务器名称（SNI），用于验证服务端证书。",
  "transport.tls.disableCustomTLSFirstByte":
    "启用 TLS 连接时，不发送 0x17 特殊字节。v0.50+ 默认 true。",
  "transport.heartbeatInterval":
    "向服务端发送心跳包的间隔时间（秒）。负值禁用。默认 10。",
  "transport.heartbeatTimeout":
    "和服务端心跳的超时时间（秒）。默认 90。",

  // ========== WebServer 配置 ==========
  "webServer.addr":
    "webServer 监听地址。默认 127.0.0.1。",
  "webServer.port":
    "webServer 监听端口。",
  "webServer.user":
    "HTTP BasicAuth 用户名。",
  "webServer.password":
    "HTTP BasicAuth 密码。",
  "webServer.assetsDir":
    "静态资源目录。Dashboard 使用的资源默认打包在二进制文件中，通过指定此参数可使用自定义静态资源。",
  "webServer.pprofEnable":
    "启动 Go HTTP pprof，用于应用调试。默认 false。",

  // ========== 日志配置 ==========
  "log.to":
    '日志输出文件路径。如果为 "console"，则将日志打印在标准输出中。默认 console。',
  "log.level":
    '日志级别。可选值为 trace, debug, info, warn, error。默认 info。',
  "log.maxDays":
    "日志文件最多保留天数。默认 3。",
  "log.disablePrintColor":
    "禁用标准输出中的日志颜色。默认 false。",

  // ========== 代理通用配置 ==========
  "proxy.name":
    "代理的唯一名称。同一用户下不可重复。",
  "proxy.type":
    "代理类型。可选值为 tcp, udp, http, https, stcp, sudp, xtcp, tcpmux。",
  "proxy.enabled":
    "是否启用此代理。true 或省略表示启用，false 表示禁用。",
  "proxy.localIP":
    "本地服务 IP 地址。",
  "proxy.localPort":
    "本地服务端口。",
  "proxy.remotePort":
    "远程端口，0 表示随机分配。仅 tcp 和 udp 类型有效。",
  "proxy.transport.bandwidthLimit":
    "带宽限制，单位为 KB 或 MB。例如 1MB, 500KB。",
  "proxy.transport.bandwidthLimitMode":
    "带宽限制位置。可选值为 client 或 server。默认 client。",
  "proxy.transport.useEncryption":
    "是否启用流量加密。默认 false。",
  "proxy.transport.useCompression":
    "是否启用流量压缩。默认 false。",
  "proxy.loadBalancer.group":
    "负载均衡分组名称。同一分组内的代理会共享负载。",
  "proxy.loadBalancer.groupKey":
    "负载均衡分组密钥。同一分组内的代理需使用相同的 groupKey。",
  "proxy.healthCheck.type":
    "健康检查类型。可选值为 tcp 或 http。",
  "proxy.healthCheck.path":
    "HTTP 健康检查路径。发起 GET 请求进行健康检查。仅 healthCheck.type 为 http 时有效。",
  "proxy.healthCheck.timeoutSeconds":
    "健康检查超时时间（秒）。默认 3。",
  "proxy.healthCheck.maxFailed":
    "最大连续失败次数。达到此值后代理会被标记为不健康。默认 3。",
  "proxy.healthCheck.intervalSeconds":
    "健康检查间隔时间（秒）。默认 10。",
  "proxy.metadatas":
    "代理附加元数据键值对，会传递给服务端插件。",
  "proxy.annotations":
    "代理附加注释信息，会在 frps 仪表板上显示。",

  // ========== HTTP/HTTPS 代理配置 ==========
  "proxy.httpUser":
    "HTTP 基本认证用户名。",
  "proxy.httpPassword":
    "HTTP 基本认证密码。",
  "proxy.subdomain":
    "子域名。例如 web01，访问地址为 web01.frps.com。",
  "proxy.customDomains":
    "自定义域名列表。",
  "proxy.locations":
    "URL 路径匹配规则，仅 http 类型可用。支持按路径前缀路由到不同后端。",
  "proxy.routeByHTTPUser":
    "按 HTTP 基本认证用户名进行路由。",
  "proxy.hostHeaderRewrite":
    "重写 Host 请求头。",
  "proxy.requestHeaders.set":
    "设置请求头。",
  "proxy.responseHeaders.set":
    "设置响应头。",
  "proxy.transport.proxyProtocolVersion":
    "Proxy Protocol 版本。可选值为 v1, v2 或空。",

  // ========== 安全代理配置 (STCP/SUDP/XTCP) ==========
  "proxy.secretKey":
    "密钥，用于 stcp/xtcp 类型的认证。访客连接时需要提供相同的 secretKey。",
  "proxy.allowUsers":
    '允许访问的用户列表。"*" 表示允许所有用户访问。',

  // ========== TCPMUX 配置 ==========
  "proxy.multiplexer":
    "TCP 多路复用器类型。当前仅支持 httpconnect。仅 tcpmux 类型有效。",

  // ========== NAT 穿透 ==========
  "proxy.natTraversal.disableAssistedAddrs":
    "禁用本地网络接口，仅使用 STUN 发现的地址进行 NAT 穿透。默认 false。",

  // ========== 插件配置 ==========
  "proxy.plugin.type":
    "插件类型。可选值为 unix_domain_socket, http_proxy, socks5, static_file, https2http, https2https, http2https, http2http, tls2raw, virtual_net。",
  "proxy.plugin.unixPath":
    "Unix 域套接字路径。仅 unix_domain_socket 插件有效。",
  "proxy.plugin.httpUser":
    "插件 HTTP 认证用户名。",
  "proxy.plugin.httpPassword":
    "插件 HTTP 认证密码。",
  "proxy.plugin.username":
    "插件 SOCKS5 认证用户名。",
  "proxy.plugin.password":
    "插件 SOCKS5 认证密码。",
  "proxy.plugin.localPath":
    "本地文件路径。仅 static_file 插件有效。",
  "proxy.plugin.stripPrefix":
    "URL 前缀剥离。仅 static_file 插件有效。",
  "proxy.plugin.localAddr":
    "本地目标地址。如 127.0.0.1:80。用于协议转换类插件。",
  "proxy.plugin.crtPath":
    "证书文件路径。",
  "proxy.plugin.keyPath":
    "密钥文件路径。",
  "proxy.plugin.hostHeaderRewrite":
    "重写 Host 请求头。",
  "proxy.plugin.requestHeaders.set":
    "设置请求头。",

  // ========== 访问者配置 ==========
  "visitor.name":
    "访问端的唯一名称。",
  "visitor.type":
    "访问端类型。可选值为 stcp 或 xtcp。",
  "visitor.serverName":
    "要访问的服务端代理名称。",
  "visitor.serverUser":
    "服务端代理所属用户，默认当前用户。",
  "visitor.secretKey":
    "认证密钥，需与服务端代理配置的 secretKey 一致。",
  "visitor.bindAddr":
    "本地绑定地址。默认 127.0.0.1。",
  "visitor.bindPort":
    "本地绑定端口。负值表示不绑定端口。",
  "visitor.keepTunnelOpen":
    "保持隧道常开。对于 xtcp 类型，即使暂时没有流量也维持 P2P 连接。",
  "visitor.maxRetriesAnHour":
    "每小时最大打洞重试次数。仅 xtcp 类型有效。",
  "visitor.minRetryInterval":
    "最小重试间隔时间（秒）。仅 xtcp 类型有效。",
  "visitor.fallbackTo":
    "回退访问端名称。当 xtcp 打洞失败时，会回退到指定的访问端。",
  "visitor.fallbackTimeoutMs":
    "回退超时时间（毫秒）。",
  "visitor.natTraversal.disableAssistedAddrs":
    "禁用本地网络接口，仅使用 STUN 发现的地址进行 NAT 穿透。默认 false。",
  "visitor.plugin.type":
    "访问端插件类型。当前仅支持 virtual_net。",
  "visitor.plugin.destinationIP":
    "虚拟网络目标 IP 地址。仅 virtual_net 插件有效。",
};
