import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Save, Trash2 } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { NumberField } from "@/components/form/NumberField";
import { SelectField } from "@/components/form/SelectField";
import { SwitchField } from "@/components/form/SwitchField";
import { FieldGroup } from "@/components/form/FieldGroup";
import { FIELD_DESCRIPTIONS } from "@/lib/fieldDescriptions";
import type { VisitorConfig, VisitorType } from "@/types/frpc";
import { visitorTypeColor } from "@/lib/utils";

const visitorTypeOptions = [
  { value: "stcp", label: "STCP" },
  { value: "xtcp", label: "XTCP" },
];

interface VisitorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visitor?: VisitorConfig;
  onSave: (visitor: VisitorConfig) => void;
  onDelete?: () => void;
}

const defaultVisitor: VisitorConfig = {
  name: "",
  type: "stcp",
};

export function VisitorDrawer({ isOpen, onClose, visitor, onSave, onDelete }: VisitorDrawerProps) {
  const [form, setForm] = useState<VisitorConfig>(defaultVisitor);
  const isEdit = !!visitor;

  useEffect(() => {
    if (visitor) {
      setForm({ ...visitor });
    } else {
      setForm({ ...defaultVisitor });
    }
  }, [visitor, isOpen]);

  const updateForm = (updates: Partial<VisitorConfig>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const isXtcp = form.type === "xtcp";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[520px] bg-background border-l border-border/50 z-50 flex flex-col shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">
                  {isEdit ? "编辑访问端" : "新建访问端"}
                </h2>
                <Badge variant="outline" className={visitorTypeColor(form.type)}>
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

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                <FieldGroup title="基础配置">
                  <TextField
                    label="name"
                    value={form.name}
                    onChange={(v) => updateForm({ name: v })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.name"]}
                  />
                  <SelectField
                    label="type"
                    value={form.type}
                    options={visitorTypeOptions}
                    onChange={(v) => updateForm({ type: v as VisitorType })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.type"]}
                  />
                </FieldGroup>

                <FieldGroup title="目标服务">
                  <TextField
                    label="serverName"
                    value={form.serverName}
                    onChange={(v) => updateForm({ serverName: v || undefined })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.serverName"]}
                  />
                  <TextField
                    label="serverUser"
                    value={form.serverUser}
                    onChange={(v) => updateForm({ serverUser: v || undefined })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.serverUser"]}
                  />
                  <TextField
                    label="secretKey"
                    value={form.secretKey}
                    onChange={(v) => updateForm({ secretKey: v || undefined })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.secretKey"]}
                  />
                </FieldGroup>

                <FieldGroup title="绑定地址">
                  <TextField
                    label="bindAddr"
                    value={form.bindAddr}
                    onChange={(v) => updateForm({ bindAddr: v })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.bindAddr"]}
                  />
                  <NumberField
                    label="bindPort"
                    value={form.bindPort}
                    onChange={(v) => updateForm({ bindPort: v })}
                    tooltip={FIELD_DESCRIPTIONS["visitor.bindPort"]}
                  />
                </FieldGroup>

                {isXtcp && (
                  <FieldGroup title="XTCP 穿透配置">
                    <SwitchField
                      label="keepTunnelOpen"
                      checked={form.keepTunnelOpen}
                      onChange={(v) => updateForm({ keepTunnelOpen: v })}
                      tooltip={FIELD_DESCRIPTIONS["visitor.keepTunnelOpen"]}
                    />
                    <NumberField
                      label="maxRetriesAnHour"
                      value={form.maxRetriesAnHour}
                      onChange={(v) => updateForm({ maxRetriesAnHour: v })}
                      tooltip={FIELD_DESCRIPTIONS["visitor.maxRetriesAnHour"]}
                    />
                    <NumberField
                      label="minRetryInterval"
                      value={form.minRetryInterval}
                      onChange={(v) => updateForm({ minRetryInterval: v })}
                      tooltip={FIELD_DESCRIPTIONS["visitor.minRetryInterval"]}
                    />
                    <TextField
                      label="fallbackTo"
                      value={form.fallbackTo}
                      onChange={(v) => updateForm({ fallbackTo: v || undefined })}
                      tooltip={FIELD_DESCRIPTIONS["visitor.fallbackTo"]}
                    />
                    <NumberField
                      label="fallbackTimeoutMs"
                      value={form.fallbackTimeoutMs}
                      onChange={(v) => updateForm({ fallbackTimeoutMs: v })}
                      tooltip={FIELD_DESCRIPTIONS["visitor.fallbackTimeoutMs"]}
                    />
                  </FieldGroup>
                )}

                <FieldGroup title="NAT 穿透">
                  <SwitchField
                    label="natTraversal.disableAssistedAddrs"
                    checked={form.natTraversal?.disableAssistedAddrs}
                    onChange={(v) =>
                      updateForm({
                        natTraversal: { disableAssistedAddrs: v },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["visitor.natTraversal.disableAssistedAddrs"]}
                  />
                </FieldGroup>

                <FieldGroup title="插件">
                  <SelectField
                    label="plugin.type"
                    value={form.plugin?.type}
                    options={[{ value: "virtual_net", label: "virtual_net" }]}
                    onChange={(v) =>
                      updateForm({
                        plugin: { type: v as "virtual_net", destinationIP: form.plugin?.destinationIP },
                      })
                    }
                    tooltip={FIELD_DESCRIPTIONS["visitor.plugin.type"]}
                  />
                  {form.plugin?.type === "virtual_net" && (
                    <TextField
                      label="plugin.destinationIP"
                      value={form.plugin?.destinationIP}
                      onChange={(v) =>
                        updateForm({
                          plugin: { ...form.plugin, destinationIP: v },
                        })
                      }
                      tooltip={FIELD_DESCRIPTIONS["visitor.plugin.destinationIP"]}
                    />
                  )}
                </FieldGroup>
              </div>
            </ScrollArea>

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
