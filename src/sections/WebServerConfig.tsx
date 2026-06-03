import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SwitchField } from "@/components/form/SwitchField";
import { FileField } from "@/components/form/FileField";

export function WebServerConfig() {
  const { config, updateWebServer } = useConfigStore();
  const ws = config.webServer || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Web 管理配置</h2>
        <p className="text-sm text-muted-foreground mt-1">配置 frpc 的内置 HTTP API 管理接口</p>
      </div>

      <FieldGroup title="监听地址" description="管理 API 的绑定地址和端口">
        <TextField
          label="webServer.addr"
          value={ws.addr}
          onChange={(v) => updateWebServer({ ...ws, addr: v })}
          description="默认 127.0.0.1"
          tooltip={FIELD_DESCRIPTIONS["webServer.addr"]}
        />
        <NumberField
          label="webServer.port"
          value={ws.port}
          onChange={(v) => updateWebServer({ ...ws, port: v })}
          tooltip={FIELD_DESCRIPTIONS["webServer.port"]}
        />
      </FieldGroup>

      <FieldGroup title="认证" description="管理接口的登录凭据">
        <TextField
          label="webServer.user"
          value={ws.user}
          onChange={(v) => updateWebServer({ ...ws, user: v })}
          tooltip={FIELD_DESCRIPTIONS["webServer.user"]}
        />
        <TextField
          label="webServer.password"
          value={ws.password}
          onChange={(v) => updateWebServer({ ...ws, password: v })}
          tooltip={FIELD_DESCRIPTIONS["webServer.password"]}
        />
      </FieldGroup>

      <FieldGroup title="高级" description="其他 Web 服务器选项">
        <FileField
          label="webServer.assetsDir"
          value={ws.assetsDir}
          onChange={(v) => updateWebServer({ ...ws, assetsDir: v || undefined })}
          tooltip={FIELD_DESCRIPTIONS["webServer.assetsDir"]}
        />
        <SwitchField
          label="webServer.pprofEnable"
          checked={ws.pprofEnable}
          onChange={(v) => updateWebServer({ ...ws, pprofEnable: v })}
          description="默认 false"
          tooltip={FIELD_DESCRIPTIONS["webServer.pprofEnable"]}
        />
      </FieldGroup>
    </div>
  );
}
