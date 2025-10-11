
"use client";

import React from 'react';
import * as Lucide from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// It's important to explicitly list the icons to avoid including all of lucide-react in the bundle.
export const iconNames = [
    'Book', 'FileText', 'PenSquare', 'ClipboardList', 'Target', 'Trophy',
    'Brain', 'Atom', 'FlaskConical', 'Beaker', 'Sigma', 'Calculator',
    'Code', 'Terminal', 'BookOpen', 'CheckSquare', 'DraftingCompass', 'Flag',
] as const;

export type IconName = typeof iconNames[number];

const LucideIcons: { [key in IconName]: React.ComponentType<any> } = {
    Book: Lucide.Book,
    FileText: Lucide.FileText,
    PenSquare: Lucide.PenSquare,
    ClipboardList: Lucide.ClipboardList,
    Target: Lucide.Target,
    Trophy: Lucide.Trophy,
    Brain: Lucide.Brain,
    Atom: Lucide.Atom,
    FlaskConical: Lucide.FlaskConical,
    Beaker: Lucide.Beaker,
    Sigma: Lucide.Sigma,
    Calculator: Lucide.Calculator,
    Code: Lucide.Code,
    Terminal: Lucide.Terminal,
    BookOpen: Lucide.BookOpen,
    CheckSquare: Lucide.CheckSquare,
    DraftingCompass: Lucide.DraftingCompass,
    Flag: Lucide.Flag
};

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
                    <CommandList>
                        <CommandEmpty>No icons found.</CommandEmpty>
                        <CommandGroup>
                            <div className="grid grid-cols-5 gap-1 p-2">
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
                                            <span className="text-xs text-center">{name}</span>
                                        </CommandItem>
                                    );
                                })}
                             </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
