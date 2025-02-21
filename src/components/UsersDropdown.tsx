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
  const showDropdown = participants.participants.length > 2;

  if (!showDropdown) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>between</span>
        {participants.participants.map((participant, index) => (
          <div key={participant.username} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <a 
                href={`https://github.com/${participant.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage 
                    src={`https://github.com/${participant.username}.png`} 
                    alt={participant.username} 
                  />
                  <AvatarFallback>{participant.username[0]}</AvatarFallback>
                </Avatar>
                <span>@{participant.username}</span>
              </a>
            </div>
            {index === 0 && <span>and</span>}
          </div>
        ))}
      </div>
    );
  }

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
          <DropdownMenuItem key={participant.username} asChild>
            <a 
              href={`https://github.com/${participant.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={`https://github.com/${participant.username}.png`} 
                  alt={participant.username} 
                />
                <AvatarFallback>{participant.username[0]}</AvatarFallback>
              </Avatar>
              <span>@{participant.username}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 