import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SwitchField } from "@/components/form/SwitchField";
import { ArrayField } from "@/components/form/ArrayField";
import { MapField } from "@/components/form/MapField";

export function GlobalConfig() {
  const { config, updateField } = useConfigStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">全局配置</h2>
        <p className="text-sm text-muted-foreground mt-1">配置 frpc 客户端的基础连接参数</p>
      </div>

      <FieldGroup title="服务器连接" description="frps 服务器的地址和端口配置">
        <TextField
          label="serverAddr"
          value={config.serverAddr}
          onChange={(v) => updateField("serverAddr", v)}
          description="IPv6 需用方括号包裹"
          tooltip={FIELD_DESCRIPTIONS["serverAddr"]}
          className="font-mono"
        />
        <NumberField
          label="serverPort"
          value={config.serverPort}
          onChange={(v) => updateField("serverPort", v)}
          description="默认 7000"
          tooltip={FIELD_DESCRIPTIONS["serverPort"]}
        />
      </FieldGroup>

      <FieldGroup title="客户端标识" description="可选的客户端标识配置">
        <TextField
          label="clientID"
          value={config.clientID}
          onChange={(v) => updateField("clientID", v || undefined)}
          tooltip={FIELD_DESCRIPTIONS["clientID"]}
        />
        <TextField
          label="user"
          value={config.user}
          onChange={(v) => updateField("user", v || undefined)}
          description="格式为 {user}.{proxy}"
          tooltip={FIELD_DESCRIPTIONS["user"]}
        />
      </FieldGroup>

      <FieldGroup title="高级选项" description="其他全局参数配置">
        <TextField
          label="natHoleStunServer"
          value={config.natHoleStunServer}
          onChange={(v) => updateField("natHoleStunServer", v || undefined)}
          tooltip={FIELD_DESCRIPTIONS["natHoleStunServer"]}
        />
        <SwitchField
          label="loginFailExit"
          checked={config.loginFailExit}
          onChange={(v) => updateField("loginFailExit", v)}
          tooltip={FIELD_DESCRIPTIONS["loginFailExit"]}
        />
        <TextField
          label="dnsServer"
          value={config.dnsServer}
          onChange={(v) => updateField("dnsServer", v || undefined)}
          tooltip={FIELD_DESCRIPTIONS["dnsServer"]}
        />
        <NumberField
          label="udpPacketSize"
          value={config.udpPacketSize}
          onChange={(v) => updateField("udpPacketSize", v)}
          description="默认 1500"
          tooltip={FIELD_DESCRIPTIONS["udpPacketSize"]}
        />
      </FieldGroup>

      <FieldGroup title="启动控制" description="控制启动时加载哪些代理">
        <ArrayField
          label="start"
          values={config.start || []}
          onChange={(v) => updateField("start", v.length > 0 ? v : undefined)}
          tooltip={FIELD_DESCRIPTIONS["start"]}
        />
      </FieldGroup>

      <FieldGroup title="功能开关" description="实验性功能控制">
        <MapField
          label="featureGates"
          value={config.featureGates ? Object.fromEntries(Object.entries(config.featureGates).map(([k, v]) => [k, String(v)])) : undefined}
          onChange={(v) => {
            const boolMap = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === "true" || val === "1"]));
            updateField("featureGates", Object.keys(boolMap).length > 0 ? boolMap : undefined);
          }}
          description="值为 true 或 false"
          tooltip={FIELD_DESCRIPTIONS["featureGates"]}
        />
      </FieldGroup>

      <FieldGroup title="元数据" description="客户端附加元数据">
        <MapField
          label="metadatas"
          value={config.metadatas}
          onChange={(v) => updateField("metadatas", Object.keys(v).length > 0 ? v : undefined)}
          tooltip={FIELD_DESCRIPTIONS["metadatas"]}
        />
      </FieldGroup>
    </div>
  );
}
