import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Save, Trash2 } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SelectField } from "@/components/form/SelectField";
import { SwitchField } from "@/components/form/SwitchField";
import { ArrayField } from "@/components/form/ArrayField";
import { MapField } from "@/components/form/MapField";
import { FieldGroup } from "@/components/form/FieldGroup";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import type { ProxyConfig, ProxyType, PluginType, HealthCheckType } from "@/types/frpc";
import { proxyTypeColor } from "@/lib/utils";

const proxyTypeOptions = [
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
  { value: "stcp", label: "STCP" },
  { value: "sudp", label: "SUDP" },
  { value: "xtcp", label: "XTCP" },
  { value: "tcpmux", label: "TCPMUX" },
];

const pluginTypeOptions = [
  { value: "unix_domain_socket", label: "unix_domain_socket" },
  { value: "http_proxy", label: "http_proxy" },
  { value: "socks5", label: "socks5" },
  { value: "static_file", label: "static_file" },
  { value: "https2http", label: "https2http" },
  { value: "https2https", label: "https2https" },
  { value: "http2https", label: "http2https" },
  { value: "http2http", label: "http2http" },
  { value: "tls2raw", label: "tls2raw" },
  { value: "virtual_net", label: "virtual_net" },
];

const healthCheckTypeOptions = [
  { value: "tcp", label: "tcp" },
  { value: "http", label: "http" },
];

const bandwidthLimitModeOptions = [
  { value: "client", label: "client" },
  { value: "server", label: "server" },
];

const proxyProtocolVersionOptions = [
  { value: "v1", label: "v1" },
  { value: "v2", label: "v2" },
];

const multiplexerOptions = [
  { value: "httpconnect", label: "httpconnect" },
];

interface ProxyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proxy?: ProxyConfig;
  onSave: (proxy: ProxyConfig) => void;
  onDelete?: () => void;
}

const defaultProxy: ProxyConfig = {
  name: "",
  type: "tcp",
  enabled: true,
  localIP: "127.0.0.1",
  localPort: 8080,
};

export function ProxyDrawer({ isOpen, onClose, proxy, onSave, onDelete }: ProxyDrawerProps) {
  const [form, setForm] = useState<ProxyConfig>(defaultProxy);
  const isEdit = !!proxy;

  useEffect(() => {
    if (proxy) {
      setForm({ ...proxy });
    } else {
      setForm({ ...defaultProxy });
    }
  }, [proxy, isOpen]);

  const updateForm = (updates: Partial<ProxyConfig>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const type = form.type;

  // Fields shown for each type
  const showRemotePort = ["tcp", "udp"].includes(type);
  const showHttpFields = ["http", "https"].includes(type);
  const showSecretKey = ["stcp", "sudp", "xtcp"].includes(type);
  const showAllowUsers = ["stcp", "sudp", "xtcp"].includes(type);
  const showTcpmuxFields = type === "tcpmux";
  const showNatTraversal = type === "xtcp";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[540px] bg-background border-l border-border/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">
                  {isEdit ? "编辑代理" : "新建代理"}
                </h2>
                <Badge
                  variant="outline"
                  className={proxyTypeColor(form.type)}
                >
                  {form.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {isEdit && onDelete && (
                  <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                {/* Basic */}
                <FieldGroup title="基础配置">
                  <TextField
                    label="name"
                    value={form.name}
                    onChange={(v) => updateForm({ name: v })}
                    tooltip={FIELD_DESCRIPTIONS["proxy.name"]}
                  />
                  <SelectField
                    label="type"
                    value={form.type}
                    options={proxyTypeOptions}
                    onChange={(v) => updateForm({ type: v as ProxyType })}
                    tooltip={FIELD_DESCRIPTIONS["proxy.type"]}
                  />
                  <div className="flex items-center gap-3 py-2">
                    <Switch
                      checked={form.enabled !== false}
                      onCheckedChange={(v) => updateForm({ enabled: v })}
                    />
                    <Label className="text-sm">启用此代理</Label>
                  </div>
                </FieldGroup>

                {/* Connection */}
                <FieldGroup title="连接配置">
                  <TextField
                    label="localIP"
                    value={form.localIP}
                    onChange={(v) => updateForm({ localIP: v })}
                    tooltip={FIELD_DESCRIPTIONS["proxy.localIP"]}
                  />
                  <NumberField
                    label="localPort"
                    value={form.localPort}
                    onChange={(v) => updateForm({ localPort: v })}
                    tooltip={FIELD_DESCRIPTIONS["proxy.localPort"]}
                  />
                  {showRemotePort && (
                    <NumberField
                      label="remotePort"
                      value={form.remotePort}
                      onChange={(v) => updateForm({ remotePort: v })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.remotePort"]}
                    />
                  )}
                </FieldGroup>

                {/* HTTP/HTTPS specific */}
                {showHttpFields && (
                  <FieldGroup title="HTTP/HTTPS 配置">
                    <TextField
                      label="subdomain"
                      value={form.subdomain}
                      onChange={(v) => updateForm({ subdomain: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.subdomain"]}
                    />
                    <ArrayField
                      label="customDomains"
                      values={form.customDomains || []}
                      onChange={(v) => updateForm({ customDomains: v.length > 0 ? v : undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.customDomains"]}
                    />
                    {type === "http" && (
                      <>
                        <ArrayField
                          label="locations"
                          values={form.locations || []}
                          onChange={(v) => updateForm({ locations: v.length > 0 ? v : undefined })}
                          tooltip={FIELD_DESCRIPTIONS["proxy.locations"]}
                        />
                        <TextField
                          label="routeByHTTPUser"
                          value={form.routeByHTTPUser}
                          onChange={(v) => updateForm({ routeByHTTPUser: v || undefined })}
                          tooltip={FIELD_DESCRIPTIONS["proxy.routeByHTTPUser"]}
                        />
                      </>
                    )}
                    <TextField
                      label="httpUser"
                      value={form.httpUser}
                      onChange={(v) => updateForm({ httpUser: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.httpUser"]}
                    />
                    <TextField
                      label="httpPassword"
                      value={form.httpPassword}
                      onChange={(v) => updateForm({ httpPassword: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.httpPassword"]}
                    />
                    <TextField
                      label="hostHeaderRewrite"
                      value={form.hostHeaderRewrite}
                      onChange={(v) => updateForm({ hostHeaderRewrite: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.hostHeaderRewrite"]}
                    />
                    <MapField
                      label="requestHeaders.set"
                      value={form.requestHeaders?.set}
                      onChange={(v) =>
                        updateForm({
                          requestHeaders: Object.keys(v).length > 0 ? { set: v } : undefined,
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.requestHeaders.set"]}
                    />
                    <MapField
                      label="responseHeaders.set"
                      value={form.responseHeaders?.set}
                      onChange={(v) =>
                        updateForm({
                          responseHeaders: Object.keys(v).length > 0 ? { set: v } : undefined,
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.responseHeaders.set"]}
                    />
                  </FieldGroup>
                )}

                {type === "https" && (
                  <FieldGroup title="HTTPS 选项">
                    <SelectField
                      label="transport.proxyProtocolVersion"
                      value={form.transport?.proxyProtocolVersion}
                      options={proxyProtocolVersionOptions}
                      onChange={(v) =>
                        updateForm({
                          transport: { ...form.transport, proxyProtocolVersion: v as "v1" | "v2" },
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.transport.proxyProtocolVersion"]}
                    />
                  </FieldGroup>
                )}

                {/* Secret proxy fields */}
                {showSecretKey && (
                  <FieldGroup title="安全代理配置">
                    <TextField
                      label="secretKey"
                      value={form.secretKey}
                      onChange={(v) => updateForm({ secretKey: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.secretKey"]}
                    />
                    <ArrayField
                      label="allowUsers"
                      values={form.allowUsers || []}
                      onChange={(v) => updateForm({ allowUsers: v.length > 0 ? v : undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.allowUsers"]}
                    />
                  </FieldGroup>
                )}

                {/* TCPMUX fields */}
                {showTcpmuxFields && (
                  <FieldGroup title="TCPMUX 配置">
                    <SelectField
                      label="multiplexer"
                      value={form.multiplexer}
                      options={multiplexerOptions}
                      onChange={(v) => updateForm({ multiplexer: v as "httpconnect" })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.multiplexer"]}
                    />
                    <ArrayField
                      label="customDomains"
                      values={form.customDomains || []}
                      onChange={(v) => updateForm({ customDomains: v.length > 0 ? v : undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.customDomains"]}
                    />
                    <TextField
                      label="routeByHTTPUser"
                      value={form.routeByHTTPUser}
                      onChange={(v) => updateForm({ routeByHTTPUser: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["proxy.routeByHTTPUser"]}
                    />
                  </FieldGroup>
                )}

                {/* NAT Traversal */}
                {showNatTraversal && (
                  <FieldGroup title="NAT 穿透">
                    <SwitchField
                      label="natTraversal.disableAssistedAddrs"
                      checked={form.natTraversal?.disableAssistedAddrs}
                      onChange={(v) =>
                        updateForm({
                          natTraversal: { disableAssistedAddrs: v },
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.natTraversal.disableAssistedAddrs"]}
                    />
                  </FieldGroup>
                )}

                {/* Transport */}
                <FieldGroup title="传输选项">
                  <TextField
                    label="transport.bandwidthLimit"
                    value={form.transport?.bandwidthLimit}
                    onChange={(v) =>
                      updateForm({
                        transport: { ...form.transport, bandwidthLimit: v || undefined },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.transport.bandwidthLimit"]}
                  />
                  <SelectField
                    label="transport.bandwidthLimitMode"
                    value={form.transport?.bandwidthLimitMode}
                    options={bandwidthLimitModeOptions}
                    onChange={(v) =>
                      updateForm({
                        transport: { ...form.transport, bandwidthLimitMode: v as "client" | "server" },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.transport.bandwidthLimitMode"]}
                  />
                  <SwitchField
                    label="transport.useEncryption"
                    checked={form.transport?.useEncryption}
                    onChange={(v) =>
                      updateForm({
                        transport: { ...form.transport, useEncryption: v },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.transport.useEncryption"]}
                  />
                  <SwitchField
                    label="transport.useCompression"
                    checked={form.transport?.useCompression}
                    onChange={(v) =>
                      updateForm({
                        transport: { ...form.transport, useCompression: v },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.transport.useCompression"]}
                  />
                </FieldGroup>

                {/* Load Balancer */}
                <FieldGroup title="负载均衡">
                  <TextField
                    label="loadBalancer.group"
                    value={form.loadBalancer?.group}
                    onChange={(v) =>
                      updateForm({
                        loadBalancer: { ...form.loadBalancer, group: v || undefined },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.loadBalancer.group"]}
                  />
                  <TextField
                    label="loadBalancer.groupKey"
                    value={form.loadBalancer?.groupKey}
                    onChange={(v) =>
                      updateForm({
                        loadBalancer: { ...form.loadBalancer, groupKey: v || undefined },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.loadBalancer.groupKey"]}
                  />
                </FieldGroup>

                {/* Health Check */}
                <FieldGroup title="健康检查">
                  <SelectField
                    label="healthCheck.type"
                    value={form.healthCheck?.type}
                    options={healthCheckTypeOptions}
                    onChange={(v) =>
                      updateForm({
                        healthCheck: { ...form.healthCheck, type: v as HealthCheckType },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.healthCheck.type"]}
                  />
                  {form.healthCheck?.type === "http" && (
                    <TextField
                      label="healthCheck.path"
                      value={form.healthCheck?.path}
                      onChange={(v) =>
                        updateForm({
                          healthCheck: { ...form.healthCheck, path: v || undefined },
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.healthCheck.path"]}
                    />
                  )}
                  <NumberField
                    label="healthCheck.timeoutSeconds"
                    value={form.healthCheck?.timeoutSeconds}
                    onChange={(v) =>
                      updateForm({
                        healthCheck: { ...form.healthCheck, timeoutSeconds: v },
                      })
                    }
                    description="默认 3"
                    tooltip={FIELD_DESCRIPTIONS["proxy.healthCheck.timeoutSeconds"]}
                  />
                  <NumberField
                    label="healthCheck.maxFailed"
                    value={form.healthCheck?.maxFailed}
                    onChange={(v) =>
                      updateForm({
                        healthCheck: { ...form.healthCheck, maxFailed: v },
                      })
                    }
                    description="默认 3"
                    tooltip={FIELD_DESCRIPTIONS["proxy.healthCheck.maxFailed"]}
                  />
                  <NumberField
                    label="healthCheck.intervalSeconds"
                    value={form.healthCheck?.intervalSeconds}
                    onChange={(v) =>
                      updateForm({
                        healthCheck: { ...form.healthCheck, intervalSeconds: v },
                      })
                    }
                    description="默认 10"
                    tooltip={FIELD_DESCRIPTIONS["proxy.healthCheck.intervalSeconds"]}
                  />
                </FieldGroup>

                {/* Metadata & Annotations */}
                <FieldGroup title="元数据">
                  <MapField
                    label="metadatas"
                    value={form.metadatas}
                    onChange={(v) =>
                      updateForm({
                        metadatas: Object.keys(v).length > 0 ? v : undefined,
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.metadatas"]}
                  />
                  <MapField
                    label="annotations"
                    value={form.annotations}
                    onChange={(v) =>
                      updateForm({
                        annotations: Object.keys(v).length > 0 ? v : undefined,
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.annotations"]}
                  />
                </FieldGroup>

                {/* Plugin */}
                <FieldGroup title="插件配置" description="使用插件处理连接">
                  <SelectField
                    label="plugin.type"
                    value={form.plugin?.type}
                    options={pluginTypeOptions}
                    onChange={(v) =>
                      updateForm({
                        plugin: { ...form.plugin, type: v as PluginType },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["proxy.plugin.type"]}
                  />

                  {form.plugin?.type === "unix_domain_socket" && (
                    <TextField
                      label="plugin.unixPath"
                      value={form.plugin?.unixPath}
                      onChange={(v) =>
                        updateForm({
                          plugin: { ...form.plugin, unixPath: v },
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["proxy.plugin.unixPath"]}
                    />
                  )}

                  {form.plugin?.type === "http_proxy" && (
                    <>
                      <TextField
                        label="plugin.httpUser"
                        value={form.plugin?.httpUser}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, httpUser: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.httpUser"]}
                      />
                      <TextField
                        label="plugin.httpPassword"
                        value={form.plugin?.httpPassword}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, httpPassword: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.httpPassword"]}
                      />
                    </>
                  )}

                  {form.plugin?.type === "socks5" && (
                    <>
                      <TextField
                        label="plugin.username"
                        value={form.plugin?.username}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, username: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.username"]}
                      />
                      <TextField
                        label="plugin.password"
                        value={form.plugin?.password}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, password: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.password"]}
                      />
                    </>
                  )}

                  {form.plugin?.type === "static_file" && (
                    <>
                      <TextField
                        label="plugin.localPath"
                        value={form.plugin?.localPath}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, localPath: v },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.localPath"]}
                      />
                      <TextField
                        label="plugin.stripPrefix"
                        value={form.plugin?.stripPrefix}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, stripPrefix: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.stripPrefix"]}
                      />
                      <TextField
                        label="plugin.httpUser"
                        value={form.plugin?.httpUser}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, httpUser: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.httpUser"]}
                      />
                      <TextField
                        label="plugin.httpPassword"
                        value={form.plugin?.httpPassword}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, httpPassword: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.httpPassword"]}
                      />
                    </>
                  )}

                  {(form.plugin?.type === "https2http" ||
                    form.plugin?.type === "https2https" ||
                    form.plugin?.type === "http2https" ||
                    form.plugin?.type === "http2http") && (
                    <>
                      <TextField
                        label="plugin.localAddr"
                        value={form.plugin?.localAddr}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, localAddr: v },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.localAddr"]}
                      />
                      {form.plugin?.type !== "http2https" &&
                        form.plugin?.type !== "http2http" && (
                          <>
                            <TextField
                              label="plugin.crtPath"
                              value={form.plugin?.crtPath}
                              onChange={(v) =>
                                updateForm({
                                  plugin: { ...form.plugin, crtPath: v || undefined },
                                })
                              }
                              tooltip={FIELD_DESCRIPTIONS["proxy.plugin.crtPath"]}
                            />
                            <TextField
                              label="plugin.keyPath"
                              value={form.plugin?.keyPath}
                              onChange={(v) =>
                                updateForm({
                                  plugin: { ...form.plugin, keyPath: v || undefined },
                                })
                              }
                              tooltip={FIELD_DESCRIPTIONS["proxy.plugin.keyPath"]}
                            />
                          </>
                        )}
                      <TextField
                        label="plugin.hostHeaderRewrite"
                        value={form.plugin?.hostHeaderRewrite}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, hostHeaderRewrite: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.hostHeaderRewrite"]}
                      />
                      <MapField
                        label="plugin.requestHeaders.set"
                        value={form.plugin?.requestHeaders?.set}
                        onChange={(v) =>
                          updateForm({
                            plugin: {
                              ...form.plugin,
                              requestHeaders: Object.keys(v).length > 0 ? { set: v } : undefined,
                            },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.requestHeaders.set"]}
                      />
                    </>
                  )}

                  {form.plugin?.type === "tls2raw" && (
                    <>
                      <TextField
                        label="plugin.localAddr"
                        value={form.plugin?.localAddr}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, localAddr: v },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.localAddr"]}
                      />
                      <TextField
                        label="plugin.crtPath"
                        value={form.plugin?.crtPath}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, crtPath: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.crtPath"]}
                      />
                      <TextField
                        label="plugin.keyPath"
                        value={form.plugin?.keyPath}
                        onChange={(v) =>
                          updateForm({
                            plugin: { ...form.plugin, keyPath: v || undefined },
                          })
                        }
                        tooltip={FIELD_DESCRIPTIONS["proxy.plugin.keyPath"]}
                      />
                    </>
                  )}
                </FieldGroup>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/50 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Save className="h-4 w-4" />
                保存
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
