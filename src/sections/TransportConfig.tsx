import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SwitchField } from "@/components/form/SwitchField";
import { SelectField } from "@/components/form/SelectField";
import { FileField } from "@/components/form/FileField";
import type { Protocol, WireProtocol } from "@/types/frpc";

const protocolOptions = [
  { value: "tcp", label: "tcp" },
  { value: "kcp", label: "kcp" },
  { value: "quic", label: "quic" },
  { value: "websocket", label: "websocket" },
  { value: "wss", label: "wss" },
];

const wireProtocolOptions = [
  { value: "v1", label: "v1" },
  { value: "v2", label: "v2" },
];

export function TransportConfig() {
  const { config, updateTransport } = useConfigStore();
  const transport = config.transport || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">传输配置</h2>
        <p className="text-sm text-muted-foreground mt-1">配置 frpc 到 frps 的连接传输参数</p>
      </div>

      <FieldGroup title="基础传输" description="连接池、超时和协议配置">
        <NumberField
          label="transport.dialServerTimeout"
          value={transport.dialServerTimeout}
          onChange={(v) => updateTransport({ ...transport, dialServerTimeout: v })}
          description="默认 10"
          tooltip={FIELD_DESCRIPTIONS["transport.dialServerTimeout"]}
        />
        <NumberField
          label="transport.dialServerKeepalive"
          value={transport.dialServerKeepalive}
          onChange={(v) => updateTransport({ ...transport, dialServerKeepalive: v })}
          description="负值禁用，默认 7200"
          tooltip={FIELD_DESCRIPTIONS["transport.dialServerKeepalive"]}
        />
        <NumberField
          label="transport.poolCount"
          value={transport.poolCount}
          onChange={(v) => updateTransport({ ...transport, poolCount: v })}
          description="默认 0"
          tooltip={FIELD_DESCRIPTIONS["transport.poolCount"]}
        />
        <SwitchField
          label="transport.tcpMux"
          checked={transport.tcpMux}
          onChange={(v) => updateTransport({ ...transport, tcpMux: v })}
          description="默认 true"
          tooltip={FIELD_DESCRIPTIONS["transport.tcpMux"]}
        />
        <NumberField
          label="transport.tcpMuxKeepaliveInterval"
          value={transport.tcpMuxKeepaliveInterval}
          onChange={(v) => updateTransport({ ...transport, tcpMuxKeepaliveInterval: v })}
          description="默认 30"
          tooltip={FIELD_DESCRIPTIONS["transport.tcpMuxKeepaliveInterval"]}
        />
        <SelectField
          label="transport.protocol"
          value={transport.protocol}
          options={protocolOptions}
          onChange={(v) => updateTransport({ ...transport, protocol: v as Protocol })}
          description="默认 tcp"
          tooltip={FIELD_DESCRIPTIONS["transport.protocol"]}
        />
        <SelectField
          label="transport.wireProtocol"
          value={transport.wireProtocol}
          options={wireProtocolOptions}
          onChange={(v) => updateTransport({ ...transport, wireProtocol: v as WireProtocol })}
          description="默认 v1"
          tooltip={FIELD_DESCRIPTIONS["transport.wireProtocol"]}
        />
        <TextField
          label="transport.connectServerLocalIP"
          value={transport.connectServerLocalIP}
          onChange={(v) => updateTransport({ ...transport, connectServerLocalIP: v })}
          description="仅 tcp/websocket 生效"
          tooltip={FIELD_DESCRIPTIONS["transport.connectServerLocalIP"]}
        />
        <TextField
          label="transport.proxyURL"
          value={transport.proxyURL}
          onChange={(v) => updateTransport({ ...transport, proxyURL: v || undefined })}
          description="仅 tcp 生效"
          tooltip={FIELD_DESCRIPTIONS["transport.proxyURL"]}
        />
      </FieldGroup>

      <FieldGroup title="QUIC 配置" description="protocol = quic 时生效">
        <NumberField
          label="transport.quic.keepalivePeriod"
          value={transport.quic?.keepalivePeriod}
          onChange={(v) =>
            updateTransport({ ...transport, quic: { ...transport.quic, keepalivePeriod: v } })
          }
          description="默认 10"
          tooltip={FIELD_DESCRIPTIONS["transport.quic.keepalivePeriod"]}
        />
        <NumberField
          label="transport.quic.maxIdleTimeout"
          value={transport.quic?.maxIdleTimeout}
          onChange={(v) =>
            updateTransport({ ...transport, quic: { ...transport.quic, maxIdleTimeout: v } })
          }
          description="默认 30"
          tooltip={FIELD_DESCRIPTIONS["transport.quic.maxIdleTimeout"]}
        />
        <NumberField
          label="transport.quic.maxIncomingStreams"
          value={transport.quic?.maxIncomingStreams}
          onChange={(v) =>
            updateTransport({ ...transport, quic: { ...transport.quic, maxIncomingStreams: v } })
          }
          description="默认 100000"
          tooltip={FIELD_DESCRIPTIONS["transport.quic.maxIncomingStreams"]}
        />
      </FieldGroup>

      <FieldGroup title="TLS 配置" description="TLS 连接加密配置">
        <SwitchField
          label="transport.tls.enable"
          checked={transport.tls?.enable}
          onChange={(v) =>
            updateTransport({ ...transport, tls: { ...transport.tls, enable: v } })
          }
          description="v0.50+ 默认 true"
          tooltip={FIELD_DESCRIPTIONS["transport.tls.enable"]}
        />
        <FileField
          label="transport.tls.certFile"
          value={transport.tls?.certFile}
          onChange={(v) =>
            updateTransport({ ...transport, tls: { ...transport.tls, certFile: v || undefined } })
          }
          tooltip={FIELD_DESCRIPTIONS["transport.tls.certFile"]}
        />
        <FileField
          label="transport.tls.keyFile"
          value={transport.tls?.keyFile}
          onChange={(v) =>
            updateTransport({ ...transport, tls: { ...transport.tls, keyFile: v || undefined } })
          }
          tooltip={FIELD_DESCRIPTIONS["transport.tls.keyFile"]}
        />
        <FileField
          label="transport.tls.trustedCaFile"
          value={transport.tls?.trustedCaFile}
          onChange={(v) =>
            updateTransport({ ...transport, tls: { ...transport.tls, trustedCaFile: v || undefined } })
          }
          tooltip={FIELD_DESCRIPTIONS["transport.tls.trustedCaFile"]}
        />
        <TextField
          label="transport.tls.serverName"
          value={transport.tls?.serverName}
          onChange={(v) =>
            updateTransport({ ...transport, tls: { ...transport.tls, serverName: v || undefined } })
          }
          tooltip={FIELD_DESCRIPTIONS["transport.tls.serverName"]}
        />
        <SwitchField
          label="transport.tls.disableCustomTLSFirstByte"
          checked={transport.tls?.disableCustomTLSFirstByte}
          onChange={(v) =>
            updateTransport({
              ...transport,
              tls: { ...transport.tls, disableCustomTLSFirstByte: v },
            })
          }
          description="v0.50+ 默认 true"
          tooltip={FIELD_DESCRIPTIONS["transport.tls.disableCustomTLSFirstByte"]}
        />
      </FieldGroup>

      <FieldGroup title="心跳配置" description="连接心跳检测">
        <NumberField
          label="transport.heartbeatInterval"
          value={transport.heartbeatInterval}
          onChange={(v) => updateTransport({ ...transport, heartbeatInterval: v })}
          description="负值禁用，默认 10"
          tooltip={FIELD_DESCRIPTIONS["transport.heartbeatInterval"]}
        />
        <NumberField
          label="transport.heartbeatTimeout"
          value={transport.heartbeatTimeout}
          onChange={(v) => updateTransport({ ...transport, heartbeatTimeout: v })}
          description="默认 90"
          tooltip={FIELD_DESCRIPTIONS["transport.heartbeatTimeout"]}
        />
      </FieldGroup>
    </div>
  );
}
