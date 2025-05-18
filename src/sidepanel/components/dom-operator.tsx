import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DomOperationForm } from "@/components/ui/dom-operation-form";

interface DomOperation {
  selector: string;
  operationType: 'modifyAttribute' | 'removeAttribute' | 'removeAllAttributes' | 'removeDOM';
  attributeName?: string;
  attributeValue?: string;
}

interface Props {
  onSaved: () => void;
}

export function DomOperator({ onSaved }: Props) {
  const [selector, setSelector] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [operations, setOperations] = useState<DomOperation[]>([]);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [operationName, setOperationName] = useState('');

  const handleHighlight = async () => {
    if (!selector) return;

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const response: any = await browser.tabs.sendMessage(tabs[0].id!, {
        type: 'highlight',
        selector
      });

      if (!response.success) {
        toast.error('操作失败', {
          description: response.error
        });
      } else {
        setIsHighlighting(true);
      }
    } catch (error) {
      toast.error('消息发送失败', {
        description: String(error)
      });
    }
  };

  const handleRemoveHighlight = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const response: any = await browser.tabs.sendMessage(tabs[0].id!, {
        type: 'removeHighlight'
      });

      if (!response.success) {
        toast.error('操作失败', {
          description: response.error
        });
      } else {
        setIsHighlighting(false);
      }
    } catch (error) {
      toast.error('消息发送失败', {
        description: String(error)
      });
    }
  };

  // 确保始终至少有一个操作
  useEffect(() => {
    if (operations.length === 0) {
      addOperation();
    }
  }, [operations]);

  const addOperation = () => {
    setOperations([...operations, {
      selector,
      operationType: 'modifyAttribute',
      attributeName: '',
      attributeValue: ''
    }]);
  };

  const removeOperation = (index: number) => {
    // 如果只剩一个操作，不允许删除
    if (operations.length <= 1) return;

    const newOperations = operations.filter((_, i) => i !== index);
    setOperations(newOperations);
  };

  const updateOperation = (index: number, operation: Partial<DomOperation>) => {
    const newOperations = [...operations];
    newOperations[index] = { ...newOperations[index], ...operation };
    setOperations(newOperations);
  };

  const executeOperations = async () => {
    // 检查是否有选择器
    if (!selector) {
      toast.error('错误', {
        description: '请先输入 CSS 选择器'
      });
      return;
    }

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const response: any = await browser.tabs.sendMessage(tabs[0].id!, {
        type: 'executeOperations',
        operations: operations.map(op => ({
          ...op,
          selector // 使用全局选择器
        }))
      });

      if (!response.success) {
        toast.error('错误', {
          description: `操作执行失败: ${response.error}`
        });
      } else {
        toast.success('成功', {
          description: '操作执行成功'
        });
      }
    } catch (error) {
      toast.error('错误', {
        description: `消息发送失败: ${error}`
      });
    }
  };

  const handleSave = async () => {
    const result = await browser.storage.sync.get(['domOperations']);
    const savedOperations = (result.domOperations || []) as any[];
    setShowNameDialog(true);
    setOperationName(`Operation ${savedOperations.length + 1}`); // 设置默认名称
  };

  const saveOperations = async () => {
    if (!operationName.trim()) {
      toast.error('错误', {
        description: '请输入操作名称'
      });
      return;
    }

    const result = await browser.storage.sync.get(['domOperations']);
    const savedOperations = (result.domOperations || []) as any[];
    const newOperation = {
      id: Date.now().toString(),
      name: operationName.trim(),
      selector,
      operations: operations,
      createdAt: Date.now()
    };

    try {
      await browser.storage.sync.set({
        domOperations: [...savedOperations, newOperation]
      });
      setOperations([]);
      setShowNameDialog(false);
      setOperationName('');
      onSaved();
      toast.success('成功', {
        description: '操作已保存'
      });
    } catch (error) {
      toast.error('错误', {
        description: `保存失败: ${error}`
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>DOM 操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入 CSS 选择器"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
            <Button
              variant="default"
              onClick={handleHighlight}
              disabled={isHighlighting}
            >
              高亮
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveHighlight}
              disabled={!isHighlighting}
            >
              取消
            </Button>
          </div>

          <div className="space-y-2">
            {operations.map((operation, index) => (
              <DomOperationForm
                key={index}
                operation={operation}
                onUpdate={(updates) => updateOperation(index, updates)}
                onRemove={() => removeOperation(index)}
                canRemove={operations.length > 1}
              />
            ))}

            <Button
              variant="secondary"
              onClick={addOperation}
              className="w-full"
            >
              添加操作
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={executeOperations}
              className="flex-1"
            >
              执行
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              className="flex-1"
            >
              保存
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSelector('');
                setOperations([]);
                setIsHighlighting(false);
                handleRemoveHighlight();
              }}
              className="flex-1"
            >
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存操作</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="请输入操作名称"
              value={operationName}
              onChange={(e) => setOperationName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              取消
            </Button>
            <Button onClick={saveOperations}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}