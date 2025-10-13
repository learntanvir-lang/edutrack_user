
"use client";

import React from 'react';
import * as Lucide from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';

export const iconNames = [
  'Book', 'FileText', 'PenSquare', 'ClipboardList', 'Target', 'Trophy',
  'Brain', 'Atom', 'FlaskConical', 'Beaker', 'Sigma', 'Calculator',
  'Code', 'Terminal', 'BookOpen', 'CheckSquare', 'DraftingCompass', 'Flag',
  'Activity', 'Airplay', 'AlarmClock', 'Album', 'Archive', 'Award', 'Backpack',
  'Bell', 'Bike', 'Briefcase', 'Brush', 'Bug', 'Building', 'Bus', 'Camera',
  'Car', 'Carrot', 'Cast', 'Cat', 'Church', 'Circle', 'Clipboard', 'Clock',
  'Cloud', 'Coffee', 'Cog', 'Compass', 'Computer', 'Cookie', 'Cpu',
  'CreditCard', 'Crown', 'CupSoda', 'Database', 'Diamond', 'Dice5', 'Dog',
  'Download', 'Drama', 'Dribbble', 'Droplet', 'Edit', 'Egg', 'Feather', 'Figma',
  'File', 'Film', 'Filter', 'Flame', 'Flashlight', 'Folder', 'Footprints', 'Gamepad',
  'Gem', 'Gift', 'GitBranch', 'Github', 'Globe', 'GraduationCap', 'Grape', 'Grid',
  'Hammer', 'Hand', 'HardDrive', 'HardHat', 'Headphones', 'Heart', 'HelpCircle',
  'Home', 'Image', 'Inbox', 'Instagram', 'Joystick', 'Key', 'Keyboard', 'Lamp',
  'Landmark', 'Laptop', 'Laugh', 'Layers', 'Layout', 'Library', 'Lightbulb', 'Link',
  'Linkedin', 'List', 'Lock', 'LogIn', 'LogOut', 'Mail', 'Map', 'MapPin', 'Menu',
  'Mic', 'Monitor', 'Moon', 'Mountain', 'Mouse', 'Music', 'Navigation', 'Newspaper',
  'Package', 'Palette', 'Paperclip', 'Pencil', 'Phone', 'PieChart', 'PiggyBank',
  'Pin', 'Plane', 'Play', 'Plug', 'Plus', 'Pocket', 'Podcast', 'Printer', 'Puzzle',
  'Quote', 'Radio', 'Recycle', 'Rocket', 'Rss', 'Ruler', 'Save', 'School', 'Scissors',
  'Search', 'Send', 'Server', 'Settings', 'Share', 'Shield', 'ShoppingBag', 'ShoppingCart',
  'Smartphone', 'Smile', 'Speaker', 'Star', 'Store', 'Sun', 'SwissFranc', 'Table',
  'Tablet', 'Tag', 'Ticket', 'Timer', 'ToggleLeft', 'ToyBrick', 'Train', 'Trash',
  'Trello', 'TrendingUp', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Upload',
  'User', 'Users', 'Video', 'Voicemail', 'Wallet', 'Watch', 'Wifi', 'Wind', 'Wine',
  'Youtube', 'Zap'
] as const;

export type IconName = typeof iconNames[number];

const LucideIcons: { [key in IconName]: React.ComponentType<any> } = Object.fromEntries(
  iconNames.map(name => [name, (Lucide as any)[name]])
) as { [key in IconName]: React.ComponentType<any> };


export const getIcon = (name?: IconName): React.ComponentType<any> | null => {
    if (name && LucideIcons[name]) {
        return LucideIcons[name];
    }
    return null;
};

interface TaskIconPickerProps {
    value?: IconName;
    onChange: (value: IconName) => void;
}

export function TaskIconPicker({ value, onChange }: TaskIconPickerProps) {
    const [open, setOpen] = React.useState(false);
    const SelectedIcon = value ? getIcon(value) : Lucide.Smile;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {SelectedIcon && <SelectedIcon className="mr-2 h-4 w-4" />}
                    {value || "Select an icon"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                <Command>
                    <CommandInput placeholder="Search icons..." />
                    <ScrollArea className="h-64">
                    <CommandList>
                        <CommandEmpty>No icons found.</CommandEmpty>
                        <CommandGroup>
                            <div className="grid grid-cols-6 gap-1 p-2">
                                {iconNames.map(name => {
                                    const IconComponent = getIcon(name);
                                    if (!IconComponent) return null;
                                    return (
                                        <CommandItem
                                            key={name}
                                            value={name}
                                            onSelect={() => {
                                                onChange(name);
                                                setOpen(false);
                                            }}
                                            className="flex flex-col items-center justify-center p-1 h-14"
                                        >
                                            <IconComponent className="h-5 w-5 mb-1" />
                                            <span className="text-xs text-center truncate w-full">{name}</span>
                                        </CommandItem>
                                    );
                                })}
                             </div>
                        </CommandGroup>
                    </CommandList>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
