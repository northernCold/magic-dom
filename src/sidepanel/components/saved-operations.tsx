import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pencil, Trash2 } from "lucide-react";
import { DomOperationForm } from "@/components/ui/dom-operation-form";

interface DomOperation {
  selector: string;
  operationType: 'modifyAttribute' | 'removeAttribute' | 'removeAllAttributes' | 'removeDOM';
  attributeName?: string;
  attributeValue?: string;
}

interface SavedOperation {
  id: string;
  name: string;
  operations: DomOperation[];
  createdAt: number;
  selector: string;
}

interface Props {
  refresh: boolean;
}

export function SavedOperations({ refresh }: Props) {
  useEffect(() => {
    loadSavedOperations();
  }, [refresh]); // 当 refresh 变化时重新加载数据

  const [savedOperations, setSavedOperations] = useState<SavedOperation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadSavedOperations = async () => {
    const result = await browser.storage.sync.get(['domOperations']);
    setSavedOperations((result.domOperations) as any[] || []);
    console.log(result.domOperations);
  };

  const executeOperation = async (operations: DomOperation[]) => {
    await browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id!, {
        type: 'executeOperations',
        operations
      });
    });
  };

  const deleteOperation = async (id: string) => {
    const newSavedOperations = savedOperations.filter(op => op.id !== id);
    await browser.storage.sync.set({ domOperations: newSavedOperations });
    setSavedOperations(newSavedOperations);
  };

  const updateOperationName = async (id: string, newName: string) => {
    const newSavedOperations = savedOperations.map(op =>
      op.id === id ? { ...op, name: newName } : op
    );
    await browser.storage.sync.set({ domOperations: newSavedOperations });
    setSavedOperations(newSavedOperations);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>已保存的操作</CardTitle>
      </CardHeader>
      <CardContent>
        {savedOperations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {savedOperations.map((savedOp) => (
              <Card key={savedOp.id}>
                <CardContent>
                  {editingId === savedOp.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={savedOp.name}
                          onChange={(e) => updateOperationName(savedOp.id, e.target.value)}
                          placeholder="操作名称"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          value={savedOp.selector}
                          placeholder="输入 CSS 选择器"
                        />
                      </div>
                      {savedOp.operations.map((op, index) => (
                        <DomOperationForm
                          key={index}
                          operation={op}
                          onUpdate={() => { }}
                          onRemove={() => { }}
                        />
                      ))}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="default"
                          onClick={() => setEditingId(null)}
                        >
                          完成
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">{savedOp.name}</h4>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => executeOperation(savedOp.operations)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(savedOp.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteOperation(savedOp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        创建时间: {new Date(savedOp.createdAt).toLocaleString()}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无保存的操作
          </div>
        )}
      </CardContent>
    </Card>
  );
}