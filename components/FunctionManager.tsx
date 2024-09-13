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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    const updatedFunctions = { ...functions }
    delete updatedFunctions[selectedFunction]
    setFunctions(updatedFunctions)
    setSelectedFunction(Object.keys(updatedFunctions)[0] || '')
    setIsDeleteDialogOpen(false)
  }

  const handleSaveChanges = () => {
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4 bg-gray-700 p-4 rounded-md">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label htmlFor="systemPrompt" className="text-gray-200 w-32">System Prompt:</Label>
          <Textarea
            id="systemPrompt"
            value={currentFunction?.systemPrompt || ''}
            onChange={(e) => handleUpdateFunction({ systemPrompt: e.target.value })}
            className="flex-grow bg-gray-600 text-gray-200 border-gray-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="userPrompt" className="text-gray-200 w-32">User Prompt:</Label>
          <Textarea
            id="userPrompt"
            value={currentFunction?.userPrompt || ''}
            onChange={(e) => handleUpdateFunction({ userPrompt: e.target.value })}
            className="flex-grow bg-gray-600 text-gray-200 border-gray-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="temp" className="text-gray-200 w-32">Temperature:</Label>
          <Input
            id="temp"
            type="number"
            value={currentFunction?.temp || 0}
            onChange={(e) => handleUpdateFunction({ temp: parseFloat(e.target.value) })}
            className="flex-grow bg-gray-600 text-gray-200 border-gray-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="model" className="text-gray-200 w-32">Model:</Label>
          <Select 
            value={currentFunction?.model || ''} 
            onValueChange={(value) => handleUpdateFunction({ model: value })}
          >
            <SelectTrigger className="flex-grow bg-gray-600 text-gray-200 border-gray-500">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">gpt-4o</SelectItem>
              <SelectItem value="gpt4o-mini">gpt4o-mini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="maxTokens" className="text-gray-200 w-32">Max Tokens:</Label>
          <Input
            id="maxTokens"
            type="number"
            value={currentFunction?.maxTokens || 0}
            onChange={(e) => handleUpdateFunction({ maxTokens: parseInt(e.target.value) })}
            className="flex-grow bg-gray-600 text-gray-200 border-gray-500"
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Save Changes</Button>
        <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete Function</Button>
      </div>

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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-200">
          <DialogHeader>
            <DialogTitle>Delete Function</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the function "{selectedFunction}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white">Cancel</Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}