'use client'

import EmojiPickerComponent from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export const CustomEmojiPicker = ({ onChange }: { onChange: (emoji: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={`size-9 pt-1 ${open ? "bg-accent/10" : ""}`}>
                    <EmojiRenderer emoji="⚪" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit rounded-[10px] p-0">
                <EmojiPickerComponent
                    onEmojiClick={(emojiData) => {
                        onChange(emojiData.emoji);
                        setOpen(false);
                    }}
                    width={350}
                    height={400}
                />
            </PopoverContent>
        </Popover>
    );
};

export const EmojiRenderer = ({ emoji }: { emoji: string }) => {
    return <span data-slot="emoji" className="text-xl leading-none inline-flex items-center justify-center">{emoji}</span>;
};

// Export with original name for backward compatibility
export const EmojiPicker = CustomEmojiPicker;