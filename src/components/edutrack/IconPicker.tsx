
"use client";

import React from 'react';
import * as Lucide from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '../ui/scroll-area';

// Curated list of over 250 icons from lucide-react
export const iconNames = [
  'Accessibility', 'Activity', 'Airplay', 'AlarmCheck', 'AlarmClock', 'AlarmPlus', 'Album',
  'AlertCircle', 'AlertTriangle', 'AlignCenter', 'AlignJustify', 'AlignLeft', 'AlignRight',
  'Anchor', 'Angry', 'Aperture', 'Archive', 'ArrowBigDown', 'ArrowBigLeft', 'ArrowBigRight',
  'ArrowBigUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Asterisk', 'AtSign',
  'Atom', 'Award', 'Axe', 'Badge', 'BadgeCheck', 'BadgeInfo', 'BadgePercent', 'BaggageClaim',
  'Banana', 'Banknote', 'BarChart', 'Baseline', 'Bath', 'Battery', 'Beaker', 'Bed',
  'Bell', 'Bike', 'Binary', 'Biohazard', 'Blinds', 'Bluetooth', 'Bold', 'Bomb',
  'Book', 'BookCopy', 'BookOpen', 'Bookmark', 'Bot', 'Box', 'Brain', 'BrainCircuit',
  'Briefcase', 'Brush', 'Bug', 'Building', 'Bus', 'Calculator', 'Calendar', 'Camera',
  'Car', 'Carrot', 'Cast', 'Cat', 'Check', 'CheckCircle', 'ChevronDown', 'ChevronLeft',
  'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight', 'ChevronsUp',
  'Chrome', 'Church', 'Circle', 'Clipboard', 'ClipboardList', 'Clock', 'Cloud', 'CloudDrizzle',
  'CloudFog', 'CloudHail', 'CloudLightning', 'CloudRain', 'CloudSnow', 'CloudSun', 'Cloudy',
  'Clover', 'Code', 'Codepen', 'Coffee', 'Cog', 'Coins', 'Compass', 'Computer', 'Contact',
  'Cookie', 'Copy', 'Copyright', 'Cpu', 'CreditCard', 'Crop', 'Cross', 'Crown', 'CupSoda',
  'Currency', 'Database', 'Delete', 'Diamond', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5',
  'Dice6', 'Dices', 'Disc', 'Dog', 'DollarSign', 'Download', 'DraftingCompass', 'Drama',
  'Dribbble', 'Droplet', 'Ear', 'Edit', 'Egg', 'Eraser', 'Euro', 'Expand', 'ExternalLink',
  'Eye', 'EyeOff', 'Facebook', 'Factory', 'Fan', 'FastForward', 'Feather', 'Figma',
  'File', 'FileCheck', 'FileCode', 'FileDigit', 'FileInput', 'FileJson', 'FileMinus',
  'FileOutput', 'FilePlus', 'FileQuestion', 'FileSearch', 'FileText', 'FileVideo', 'FileX',
  'Files', 'Film', 'Filter', 'Flag', 'Flame', 'Flashlight', 'FlaskConical', 'Folder',
  'Footprints', 'Forward', 'Framer', 'Frown', 'FunctionSquare', 'Gamepad', 'GanttChart',
  'Gauge', 'Gem', 'Ghost', 'Gift', 'GitBranch', 'GitCommit', 'GitFork', 'GitMerge',
  'GitPullRequest', 'Github', 'Gitlab', 'Globe', 'GraduationCap', 'Grape', 'Grid',
  'Grip', 'Hammer', 'Hand', 'HardDrive', 'HardHat', 'Hash', 'Haze', 'Headphones', 'Heart',
  'HelpCircle', 'Hexagon', 'Highlighter', 'History', 'Home', 'Hourglass', 'Image', 'Inbox',
  'Indent', 'IndianRupee', 'Infinity', 'Info', 'Instagram', 'Italic', 'IterationCcw',
  'IterationCw', 'JapaneseYen', 'Joystick', 'Key', 'Keyboard', 'Lamp', 'Landmark',
  'Languages', 'Laptop', 'Laugh', 'Layers', 'Layout', 'Library', 'LifeBuoy', 'Lightbulb',
  'Link', 'Linkedin', 'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Mail', 'Map', 'MapPin',
  'Maximize', 'Meh', 'Menu', 'MessageCircle', 'MessageSquare', 'Mic', 'Minimize', 'Minus',
  'Monitor', 'Moon', 'MoreHorizontal', 'MoreVertical', 'Mountain', 'Mouse', 'MousePointer',
  'Move', 'Music', 'Navigation', 'Network', 'Newspaper', 'Nut', 'Octagon', 'Option',
  'Outdent', 'Package', 'Palette', 'Paperclip', 'Parentheses', 'ParkingCircle', 'Pause',
  'Pen', 'PenSquare', 'Pencil', 'Percent', 'PersonStanding', 'Phone', 'PictureInPicture',
  'PieChart', 'PiggyBank', 'Pin', 'Pipette', 'Plane', 'Play', 'Plug', 'Plus', 'Pocket',
  'Podcast', 'Pointer', 'PoundSterling', 'Power', 'Printer', 'Puzzle', 'QrCode', 'Quote',
  'Radio', 'RadioTower', 'Rat', 'Receipt', 'RectangleHorizontal', 'RectangleVertical', 'Recycle',
  'Redo', 'RefreshCcw', 'RefreshCw', 'Regex', 'Repeat', 'Reply', 'Rewind', 'Rocket', 'RotateCcw',
  'RotateCw', 'Rss', 'Ruler', 'RussianRuble', 'Save', 'Scale', 'Scan', 'School', 'Scissors',
  'ScreenShare', 'Scroll', 'Search', 'Send', 'SeparatorHorizontal', 'SeparatorVertical', 'Server',
  'Settings', 'Share', 'Shield', 'Ship', 'ShoppingBag', 'ShoppingCart', 'Shovel', 'Shrink',
  'Shuffle', 'Sigma', 'Signal', 'Smile', 'Snowflake', 'Sofa', 'SortAsc', 'SortDesc', 'Spade',
  'Speaker', 'Sprout', 'Square', 'Star', 'Stethoscope', 'Sticker', 'StickyNote', 'StopCircle',
  'Store', 'StretchHorizontal', 'StretchVertical', 'Strikethrough', 'Subtitles', 'Sun', 'Sunrise',
  'Sunset', 'SwissFranc', 'SwitchCamera', 'Table', 'Tablet', 'Tag', 'Tags', 'Target', 'Tent',
  'Terminal', 'Text', 'Thermometer', 'ThumbsDown', 'ThumbsUp', 'Ticket', 'Timer', 'ToggleLeft',
  'ToggleRight', 'Tornado', 'ToyBrick', 'Train', 'Trash', 'TreePine', 'TrendingDown',
  'TrendingUp', 'Triangle', 'Trophy', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Underline',
  'Undo', 'Unlink', 'Unlock', 'Upload', 'User', 'Users', 'Utensils', 'Vegan', 'Verified',
  'Vibrate', 'Video', 'View', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Wallet',
  'Wallpaper', 'Watch', 'Waves', 'Webcam', 'Webhook', 'Wifi', 'Wind', 'Wine', 'Wrench',
  'X', 'Youtube', 'Zap', 'ZoomIn', 'ZoomOut'
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

interface IconPickerProps {
    value?: IconName;
    onChange: (value: IconName) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
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
