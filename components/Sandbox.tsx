import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFunction } from '@/lib/functions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import MDEditor from '@uiw/react-md-editor'

// Custom styles for the MDEditor
const mdEditorStyles = {
  backgroundColor: '#374151', // Matches bg-gray-700
  color: '#e5e7eb', // Light text color
}

interface SandboxProps {
  sandboxText: string
  setSandboxText: (text: string) => void
  selectedFunction: string
  setSelectedFunction: (functionName: string) => void
  functions: Record<string, AIFunction>
  setFunctions: (functions: Record<string, AIFunction>) => void
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>
}

export default function Sandbox({
  sandboxText,
  setSandboxText,
  selectedFunction,
  setSelectedFunction,
  functions,
  setFunctions,
  executeFunction
}: SandboxProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [showManageFunctions, setShowManageFunctions] = useState(false)

  const handleExecute = async () => {
    if (!selectedFunction || !sandboxText.trim()) return
    setIsExecuting(true)
    try {
      console.log("Executing function:", selectedFunction)
      console.log("Input:", sandboxText)
      const result = await executeFunction(selectedFunction, sandboxText)
      console.log("Result:", result)
      if (result) {
        setSandboxText(result)
      }
    } catch (error) {
      console.error("Error executing function:", error)
      alert("An error occurred while executing the function. Please try again.")
    } finally {
      setIsExecuting(false)
    }
  }

  const updateFunction = (key: keyof AIFunction, value: string | number) => {
    if (selectedFunction) {
      setFunctions({
        ...functions,
        [selectedFunction]: {
          ...functions[selectedFunction],
          [key]: value
        }
      })
    }
  }

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Sandbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div data-color-mode="dark" className="bg-gray-700 rounded-md overflow-hidden">
          <MDEditor
            value={sandboxText}
            onChange={(value) => setSandboxText(value || '')}
            preview="edit"
            className="!bg-gray-700"
            textareaProps={{
              placeholder: "Enter text here...",
              className: "!bg-gray-700 !text-gray-100",
            }}
            previewOptions={{
              className: "!bg-gray-700 !text-gray-100",
            }}
            height={320}
            minHeight={320}
            maxHeight={1000}
            style={mdEditorStyles}
          />
        </div>
        <div className="flex space-x-2">
          <Select value={selectedFunction} onValueChange={setSelectedFunction} className="flex-grow">
            <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(functions).map((funcName) => (
                <SelectItem key={funcName} value={funcName}>
                  {funcName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleExecute} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isExecuting || !selectedFunction}
          >
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
          <Button
            onClick={() => setShowManageFunctions(!showManageFunctions)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Manage Functions
          </Button>
        </div>
        {showManageFunctions && selectedFunction && (
          <div className="p-4 space-y-4 border border-gray-600 rounded-md bg-gray-700">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-white">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={functions[selectedFunction].systemPrompt}
                onChange={(e) => updateFunction('systemPrompt', e.target.value)}
                className="bg-gray-600 border-gray-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPrompt" className="text-white">User Prompt</Label>
              <Textarea
                id="userPrompt"
                value={functions[selectedFunction].userPrompt}
                onChange={(e) => updateFunction('userPrompt', e.target.value)}
                className="bg-gray-600 border-gray-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp" className="text-white">Temperature</Label>
              <Input
                id="temp"
                type="number"
                value={functions[selectedFunction].temp}
                onChange={(e) => updateFunction('temp', parseFloat(e.target.value))}
                className="bg-gray-600 border-gray-500 text-white"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-white">Model</Label>
              <Input
                id="model"
                value={functions[selectedFunction].model}
                onChange={(e) => updateFunction('model', e.target.value)}
                className="bg-gray-600 border-gray-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens" className="text-white">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={functions[selectedFunction].maxTokens}
                onChange={(e) => updateFunction('maxTokens', parseInt(e.target.value))}
                className="bg-gray-600 border-gray-500 text-white"
                min="1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}