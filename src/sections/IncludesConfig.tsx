import { useConfigStore } from "@/store/configStore";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import { FieldGroup } from "@/components/form/FieldGroup";
import { ArrayField } from "@/components/form/ArrayField";

export function IncludesConfig() {
  const { config, updateIncludes } = useConfigStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Includes 配置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          引入其他配置文件中的代理定义，支持通配符
        </p>
      </div>

      <FieldGroup title="包含文件" description="额外的代理配置文件路径列表">
        <ArrayField
          label="includes"
          values={config.includes || []}
          onChange={(v) => updateIncludes(v.length > 0 ? v : [])}
          description="支持通配符，如 ./confd/*.ini"
          tooltip={FIELD_DESCRIPTIONS["includes"]}
        />
      </FieldGroup>
    </div>
  );
}
