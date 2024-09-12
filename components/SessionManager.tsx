import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SessionManagerProps {
  session: string
  setSession: (session: string) => void
  sessions: string[]
  setSessions: (sessions: string[]) => void
  onSaveSession: (sessionName: string) => void
  onLoadSession: (sessionName: string) => void
  onDeleteSession: (sessionName: string) => void
}

export function SessionManager({ session, setSession, sessions, setSessions, onSaveSession, onLoadSession, onDeleteSession }: SessionManagerProps) {
  const [newSessionName, setNewSessionName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSaveSession = () => {
    if (newSessionName) {
      onSaveSession(newSessionName)
      setIsDialogOpen(false)
      setNewSessionName('')
    }
  }

  const handleLoadSession = (sessionName: string) => {
    setSession(sessionName)
    onLoadSession(sessionName)
  }

  return (
    <div className="flex items-center space-x-4 w-full">
      <Select onValueChange={handleLoadSession} value={session} className="flex-grow">
        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-100">
          <SelectValue placeholder="Select session">
            {session || "Select session"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {sessions.map((s) => (
            <SelectItem key={s} value={s} className="text-gray-100 hover:bg-gray-700">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center space-x-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white w-32">Save Session</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Save Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                placeholder="Enter session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <Button onClick={handleSaveSession} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => onDeleteSession(session)} 
          variant="outline" 
          className="bg-red-600 hover:bg-red-700 text-white w-32"
          disabled={!session}
        >
          Delete Session
        </Button>
      </div>
    </div>
  )
}