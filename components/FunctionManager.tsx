import React, { useState, useEffect } from 'react'
import { AIFunction } from '@/lib/functions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FunctionManagerProps {
  functions: Record<string, AIFunction>
  setFunctions: (functions: Record<string, AIFunction>) => void
  selectedFunction: string
  setSelectedFunction: (functionName: string) => void
}

export const FunctionManager: React.FC<FunctionManagerProps> = ({
  functions,
  setFunctions,
  selectedFunction,
  setSelectedFunction
}) => {
  const [currentFunction, setCurrentFunction] = useState<AIFunction>(functions[selectedFunction])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newFunctionName, setNewFunctionName] = useState(selectedFunction)

  useEffect(() => {
    setCurrentFunction(functions[selectedFunction])
    setNewFunctionName(selectedFunction)
  }, [selectedFunction, functions])

  const handleUpdateFunction = (updates: Partial<AIFunction>) => {
    setCurrentFunction({ ...currentFunction, ...updates })
  }

  const handleSave = () => {
    setIsDialogOpen(true)
  }

  const handleConfirmSave = () => {
    setFunctions({
      ...functions,
      [newFunctionName]: currentFunction
    })
    setSelectedFunction(newFunctionName)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 bg-gray-700 p-4 rounded-md">
      <div className="grid grid-cols-3 gap-4 items-center">
        <Label htmlFor="systemPrompt" className="text-gray-200">System Prompt:</Label>
        <Textarea
          id="systemPrompt"
          value={currentFunction?.systemPrompt || ''}
          onChange={(e) => handleUpdateFunction({ systemPrompt: e.target.value })}
          className="col-span-2 bg-gray-600 text-gray-200 border-gray-500"
        />

        <Label htmlFor="userPrompt" className="text-gray-200">User Prompt:</Label>
        <Textarea
          id="userPrompt"
          value={currentFunction?.userPrompt || ''}
          onChange={(e) => handleUpdateFunction({ userPrompt: e.target.value })}
          className="col-span-2 bg-gray-600 text-gray-200 border-gray-500"
        />

        <Label htmlFor="temp" className="text-gray-200">Temperature:</Label>
        <Input
          id="temp"
          type="number"
          value={currentFunction?.temp || 0}
          onChange={(e) => handleUpdateFunction({ temp: parseFloat(e.target.value) })}
          className="col-span-2 bg-gray-600 text-gray-200 border-gray-500"
        />

        <Label htmlFor="model" className="text-gray-200">Model:</Label>
        <Select 
          value={currentFunction?.model || ''} 
          onValueChange={(value) => handleUpdateFunction({ model: value })}
        >
          <SelectTrigger className="col-span-2 bg-gray-600 text-gray-200 border-gray-500">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
            <SelectItem value="gpt4o-mini">gpt4o-mini</SelectItem>
          </SelectContent>
        </Select>

        <Label htmlFor="maxTokens" className="text-gray-200">Max Tokens:</Label>
        <Input
          id="maxTokens"
          type="number"
          value={currentFunction?.maxTokens || 0}
          onChange={(e) => handleUpdateFunction({ maxTokens: parseInt(e.target.value) })}
          className="col-span-2 bg-gray-600 text-gray-200 border-gray-500"
        />
      </div>
      
      <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-200">
          <DialogHeader>
            <DialogTitle>Save Function</DialogTitle>
          </DialogHeader>
          <Label htmlFor="functionName" className="text-gray-200">Function Name</Label>
          <Input
            id="functionName"
            value={newFunctionName}
            onChange={(e) => setNewFunctionName(e.target.value)}
            className="bg-gray-700 text-gray-200 border-gray-600"
          />
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white">Cancel</Button>
            <Button onClick={handleConfirmSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}