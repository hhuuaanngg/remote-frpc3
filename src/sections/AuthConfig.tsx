import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { TextField } from "@/components/form/TextField";
import { SelectField } from "@/components/form/SelectField";
import { FileField } from "@/components/form/FileField";
import { SwitchField } from "@/components/form/SwitchField";
import { ArrayField } from "@/components/form/ArrayField";
import { MapField } from "@/components/form/MapField";
import type { AuthMethod } from "@/types/frpc";

const authMethodOptions = [
  { value: "token", label: "Token" },
  { value: "oidc", label: "OIDC" },
];

export function AuthConfig() {
  const { config, updateAuth } = useConfigStore();
  const auth = config.auth || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">认证配置</h2>
        <p className="text-sm text-muted-foreground mt-1">配置 frpc 连接到 frps 的认证方式</p>
      </div>

      <FieldGroup title="认证方式">
        <SelectField
          label="auth.method"
          value={auth.method}
          options={authMethodOptions}
          onChange={(v) => updateAuth({ ...auth, method: v as AuthMethod })}
          tooltip={FIELD_DESCRIPTIONS["auth.method"]}
        />
        <ArrayField
          label="auth.additionalScopes"
          values={auth.additionalScopes || []}
          onChange={(v) => updateAuth({ ...auth, additionalScopes: v.length > 0 ? v : undefined })}
          description="可选值：HeartBeats, NewWorkConns"
          tooltip={FIELD_DESCRIPTIONS["auth.additionalScopes"]}
        />
      </FieldGroup>

      {auth.method === "token" && (
        <FieldGroup title="Token 认证">
          <TextField
            label="auth.token"
            value={auth.token}
            onChange={(v) => updateAuth({ ...auth, token: v || undefined, tokenSource: undefined })}
            description="与 tokenSource 互斥"
            tooltip={FIELD_DESCRIPTIONS["auth.token"]}
          />
          <div className="text-xs text-muted-foreground py-2">— 或 —</div>
          <SelectField
            label="auth.tokenSource.type"
            value={auth.tokenSource?.type}
            options={[{ value: "file", label: "file" }]}
            onChange={(v) =>
              updateAuth({
                ...auth,
                token: undefined,
                tokenSource: { type: v as "file", file: { path: auth.tokenSource?.file?.path || "" } },
              })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.tokenSource.type"]}
          />
          <FileField
            label="auth.tokenSource.file.path"
            value={auth.tokenSource?.file?.path}
            onChange={(v) =>
              updateAuth({
                ...auth,
                token: undefined,
                tokenSource: { type: "file", file: { path: v } },
              })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.tokenSource.file.path"]}
          />
        </FieldGroup>
      )}

      {auth.method === "oidc" && (
        <FieldGroup title="OIDC 认证">
          <TextField
            label="auth.oidc.clientID"
            value={auth.oidc?.clientID}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, clientID: v || undefined } })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.clientID"]}
          />
          <TextField
            label="auth.oidc.clientSecret"
            value={auth.oidc?.clientSecret}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, clientSecret: v || undefined } })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.clientSecret"]}
          />
          <TextField
            label="auth.oidc.audience"
            value={auth.oidc?.audience}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, audience: v || undefined } })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.audience"]}
          />
          <TextField
            label="auth.oidc.scope"
            value={auth.oidc?.scope}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, scope: v || undefined } })
            }
            description="默认为空"
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.scope"]}
          />
          <TextField
            label="auth.oidc.tokenEndpointURL"
            value={auth.oidc?.tokenEndpointURL}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, tokenEndpointURL: v || undefined } })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.tokenEndpointURL"]}
          />
          <MapField
            label="auth.oidc.additionalEndpointParams"
            value={auth.oidc?.additionalEndpointParams}
            onChange={(v) =>
              updateAuth({
                ...auth,
                oidc: { ...auth.oidc, additionalEndpointParams: Object.keys(v).length > 0 ? v : undefined },
              })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.additionalEndpointParams"]}
          />
          <FileField
            label="auth.oidc.trustedCaFile"
            value={auth.oidc?.trustedCaFile}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, trustedCaFile: v || undefined } })
            }
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.trustedCaFile"]}
          />
          <SwitchField
            label="auth.oidc.insecureSkipVerify"
            checked={auth.oidc?.insecureSkipVerify}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, insecureSkipVerify: v } })
            }
            description="不安全，仅用于调试"
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.insecureSkipVerify"]}
          />
          <TextField
            label="auth.oidc.proxyURL"
            value={auth.oidc?.proxyURL}
            onChange={(v) =>
              updateAuth({ ...auth, oidc: { ...auth.oidc, proxyURL: v || undefined } })
            }
            description="支持 http, https, socks5, socks5h"
            tooltip={FIELD_DESCRIPTIONS["auth.oidc.proxyURL"]}
          />
        </FieldGroup>
      )}
    </div>
  );
}
