import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DomOperation {
    selector: string;
    operationType: 'modifyAttribute' | 'removeAttribute' | 'removeAllAttributes' | 'removeDOM';
    attributeName?: string;
    attributeValue?: string;
}

interface Props {
    operation: DomOperation;
    onUpdate: (operation: Partial<DomOperation>) => void;
    onRemove: () => void;
    canRemove?: boolean;
    isEditing?: boolean;
}

export function DomOperationForm({ operation, onUpdate, onRemove, canRemove = true, isEditing = false }: Props) {
    return (
        <div className="space-y-2 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <Select
                    value={operation.operationType}
                    onValueChange={(value) => onUpdate({
                        operationType: value as DomOperation['operationType']
                    })}
                    disabled={isEditing}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="选择操作类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="modifyAttribute">修改属性</SelectItem>
                        <SelectItem value="removeAttribute">删除属性</SelectItem>
                        <SelectItem value="removeAllAttributes">删除所有属性</SelectItem>
                        <SelectItem value="removeDOM">删除DOM</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    disabled={!canRemove}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {operation.operationType !== 'removeDOM' &&
                operation.operationType !== 'removeAllAttributes' && (
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="属性名"
                            value={operation.attributeName}
                            onChange={(e) => onUpdate({
                                attributeName: e.target.value
                            })}
                            disabled={isEditing}
                        />
                        {operation.operationType === 'modifyAttribute' && (
                            <Input
                                type="text"
                                placeholder="属性值"
                                value={operation.attributeValue}
                                onChange={(e) => onUpdate({
                                    attributeValue: e.target.value
                                })}
                                disabled={isEditing}
                            />
                        )}
                    </div>
                )}
        </div>
    );
}