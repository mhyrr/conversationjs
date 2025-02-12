import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { Users } from "lucide-react"
import participants from '../../participants.json'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'

export function UsersDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Participants</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {participants.participants.map((participant) => (
          <DropdownMenuItem key={participant.username} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={`https://github.com/${participant.username}.png`} 
                alt={participant.username} 
              />
              <AvatarFallback>{participant.username[0]}</AvatarFallback>
            </Avatar>
            <span>@{participant.username}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 