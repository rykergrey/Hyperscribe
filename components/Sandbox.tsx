import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFunction } from '@/lib/functions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MDEditor from '@uiw/react-md-editor'
import { FunctionManager } from './FunctionManager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Custom styles for the MDEditor
const mdEditorStyles = {
  backgroundColor: '#374151', // Matches bg-gray-700
  color: '#e5e7eb', // Light text color
}

interface SandboxProps {
  sandboxText: string
  setSandboxText: React.Dispatch<React.SetStateAction<string>>
  selectedFunction: string
  setSelectedFunction: React.Dispatch<React.SetStateAction<string>>
  functions: Record<string, AIFunction>
  setFunctions: React.Dispatch<React.SetStateAction<Record<string, AIFunction>>>
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
  const [showClearDialog, setShowClearDialog] = useState(false)

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

  const handleClearSandbox = () => {
    setSandboxText('')
    setShowClearDialog(false)
  }

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Sandbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Select value={selectedFunction} onValueChange={setSelectedFunction}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 w-full">
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
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleExecute} 
              className="bg-purple-600 hover:bg-purple-700 flex-grow"
              disabled={isExecuting || !selectedFunction || !sandboxText.trim()}
            >
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
            <Button
              onClick={() => setShowManageFunctions(!showManageFunctions)}
              className="bg-blue-600 hover:bg-blue-700 flex-grow"
            >
              {showManageFunctions ? 'Close Manager' : 'Manage Functions'}
            </Button>
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 flex-grow">
                  Clear
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-gray-100">
                <DialogHeader>
                  <DialogTitle>Clear Sandbox</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to clear the sandbox? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => setShowClearDialog(false)} className="bg-gray-600 hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleClearSandbox} className="bg-red-600 hover:bg-red-700">
                    Clear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {showManageFunctions && (
          <FunctionManager
            functions={functions}
            setFunctions={setFunctions}
            selectedFunction={selectedFunction}
            setSelectedFunction={setSelectedFunction}
          />
        )}
        
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
      </CardContent>
    </Card>
  )
}