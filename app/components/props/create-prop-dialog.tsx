'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon, HelpCircle, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { createProp } from "@/app/actions/props/create-prop";
import { usePath } from "@/hooks/use-path";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type User = {
    id: string;
    name: string | null;
}

type UserEVItem = {
    userId: string;
    userName: string;
    ev: number;
}

export const CreatePropDialog = ({ 
    className='',
    users
}: { 
    className?: string;
    users: User[];
}) => {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userEVs, setUserEVs] = useState<UserEVItem[]>([]);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const path = usePath();

    const availableUsers = users.filter(user => 
        !userEVs.some(item => item.userId === user.id)
    );

    const handleAddUser = () => {
        if (!selectedUserId) return;
        
        const selectedUser = users.find(user => user.id === selectedUserId);
        if (!selectedUser) return;

        setUserEVs([...userEVs, {
            userId: selectedUser.id,
            userName: selectedUser.name || 'Unknown user',
            ev: 0
        }]);
        setSelectedUserId("");
    };

    const handleRemoveUser = (userId: string) => {
        setUserEVs(userEVs.filter(item => item.userId !== userId));
    };

    const handleUpdateEV = (userId: string, ev: number) => {
        setUserEVs(userEVs.map(item => 
            item.userId === userId ? { ...item, ev } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!description) {
            toast.error("Please provide a description");
            return;
        }

        if (userEVs.length === 0) {
            toast.error("Please add at least one user");
            return;
        }

        if (!endDate) {
            toast.error("Please select an end date/time");
            return;
        }

        try {
            await createProp({
                description,
                userEvs: userEVs.map(item => ({ userId: item.userId, ev: item.ev })),
                endDate,
                path
            });
            
            toast.success("Prop created successfully");
            setDescription("");
            setUserEVs([]);
            setEndDate(undefined);
            setOpen(false);
        } catch (error) {
            toast.error("Failed to create prop");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='default' className={className}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span>Create prop</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create prop</DialogTitle>
                    <DialogDescription>
                        For each prop, don't add any numbers in the description. You will add the EV for the user after you add them from the dropdown, and then you will set the lines after you create the prop.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input 
                                id="description" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                placeholder="i.e. Beers that nate will drink"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end-date">End Date & Time</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="end-date"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Input
                                    type="time"
                                    value={endDate ? format(endDate, "HH:mm") : ""}
                                    onChange={(e) => {
                                        if (!endDate) return;
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = new Date(endDate);
                                        newDate.setHours(hours, minutes);
                                        setEndDate(newDate);
                                    }}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="user">User</Label>
                                <Select 
                                    value={selectedUserId} 
                                    onValueChange={setSelectedUserId}
                                >
                                    <SelectTrigger id="user">
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user, index) => (
                                            index === 0 && user.name === "All" ? null : (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name || 'Unknown user'}
                                                </SelectItem>
                                            )
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                type="button" 
                                onClick={handleAddUser}
                                disabled={!selectedUserId}
                            >
                                Add
                            </Button>
                        </div>
                        
                        {userEVs.length > 0 && (
                            <div className="space-y-3 mt-4">
                                <Label>Added Users</Label>
                                <div className="space-y-2">
                                    {userEVs.map((item) => (
                                        <div key={item.userId} className="flex items-center gap-2 p-3 border rounded-md">
                                            <div className="flex-1 font-medium">{item.userName}</div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`ev-${item.userId}`} className="flex items-center gap-1">
                                                    EV
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Expected Value - a numerical value representing the likelihood of the outcome</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <Input 
                                                    id={`ev-${item.userId}`}
                                                    className="w-20"
                                                    type="number"
                                                    value={item.ev.toString()}
                                                    onChange={e => handleUpdateEV(item.userId, Number(e.target.value))}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveUser(item.userId)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={description === "" || userEVs.length === 0 || !endDate}
                    >
                        Create Prop
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}