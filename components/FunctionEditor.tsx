import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFunction } from '@/lib/functions'

interface FunctionEditorProps {
  selectedFunction: string
  setSelectedFunction: (functionName: string) => void
  functions: Record<string, AIFunction>
  setFunctions: (functions: Record<string, AIFunction>) => void
  onClose: () => void
}

const FunctionEditor: React.FC<FunctionEditorProps> = ({
  selectedFunction,
  setSelectedFunction,
  functions,
  setFunctions,
  onClose
}) => {
  const [editedFunction, setEditedFunction] = useState<AIFunction | null>(null)

  useEffect(() => {
    if (selectedFunction && functions[selectedFunction]) {
      setEditedFunction(functions[selectedFunction])
    } else {
      setEditedFunction(null)
    }
  }, [selectedFunction, functions])

  const handleSaveFunction = async () => {
    if (editedFunction) {
      const newFunctions = {
        ...functions,
        [editedFunction.name]: editedFunction
      }
      if (selectedFunction !== editedFunction.name) {
        delete newFunctions[selectedFunction]
      }

      setFunctions(newFunctions)
      setSelectedFunction(editedFunction.name)

      try {
        const response = await fetch('/api/update-functions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ functions: newFunctions }),
        })

        if (!response.ok) {
          throw new Error('Failed to update functions on server')
        }
      } catch (error) {
        console.error('Error saving function:', error)
        // Handle error (e.g., show error message to user)
      }
    }
  }

  const handleInputChange = (field: keyof AIFunction, value: string | number) => {
    if (editedFunction) {
      setEditedFunction({ ...editedFunction, [field]: value })
    }
  }

  if (!editedFunction) return null

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Function Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={editedFunction.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Function Name"
          className="w-full bg-gray-700 border-gray-600 text-gray-100"
        />
        <Textarea
          value={editedFunction.systemPrompt}
          onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
          placeholder="System Prompt"
          className="w-full bg-gray-700 border-gray-600 text-gray-100 min-h-[100px]"
        />
        <Textarea
          value={editedFunction.userPrompt}
          onChange={(e) => handleInputChange('userPrompt', e.target.value)}
          placeholder="User Prompt"
          className="w-full bg-gray-700 border-gray-600 text-gray-100 min-h-[100px]"
        />
        <Input
          type="number"
          value={editedFunction.temp}
          onChange={(e) => handleInputChange('temp', parseFloat(e.target.value))}
          placeholder="Temperature"
          className="w-full bg-gray-700 border-gray-600 text-gray-100"
        />
        <Input
          value={editedFunction.model}
          onChange={(e) => handleInputChange('model', e.target.value)}
          placeholder="Model"
          className="w-full bg-gray-700 border-gray-600 text-gray-100"
        />
        <Input
          type="number"
          value={editedFunction.maxTokens}
          onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
          placeholder="Max Tokens"
          className="w-full bg-gray-700 border-gray-600 text-gray-100"
        />
        <div className="flex space-x-2">
          <Button onClick={handleSaveFunction} className="bg-green-600 hover:bg-green-700">Save Function</Button>
          <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FunctionEditor