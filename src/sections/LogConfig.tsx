import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SwitchField } from "@/components/form/SwitchField";
import { SelectField } from "@/components/form/SelectField";
import type { LogLevel } from "@/types/frpc";

const logLevelOptions = [
  { value: "trace", label: "trace" },
  { value: "debug", label: "debug" },
  { value: "info", label: "info" },
  { value: "warn", label: "warn" },
  { value: "error", label: "error" },
];

export function LogConfig() {
  const { config, updateLog } = useConfigStore();
  const log = config.log || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">日志配置</h2>
        <p className="text-sm text-muted-foreground mt-1">配置 frpc 的日志输出行为</p>
      </div>

      <FieldGroup title="日志输出" description="日志的目标位置和级别">
        <TextField
          label="log.to"
          value={log.to}
          onChange={(v) => updateLog({ ...log, to: v })}
          tooltip={FIELD_DESCRIPTIONS["log.to"]}
        />
        <SelectField
          label="log.level"
          value={log.level}
          options={logLevelOptions}
          onChange={(v) => updateLog({ ...log, level: v as LogLevel })}
          description="默认 info"
          tooltip={FIELD_DESCRIPTIONS["log.level"]}
        />
      </FieldGroup>

      <FieldGroup title="日志管理" description="日志文件管理选项">
        <NumberField
          label="log.maxDays"
          value={log.maxDays}
          onChange={(v) => updateLog({ ...log, maxDays: v })}
          description="默认 3"
          tooltip={FIELD_DESCRIPTIONS["log.maxDays"]}
        />
        <SwitchField
          label="log.disablePrintColor"
          checked={log.disablePrintColor}
          onChange={(v) => updateLog({ ...log, disablePrintColor: v })}
          description="默认 false"
          tooltip={FIELD_DESCRIPTIONS["log.disablePrintColor"]}
        />
      </FieldGroup>
    </div>
  );
}
