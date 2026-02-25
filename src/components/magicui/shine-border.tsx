"use client";

import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps {
    borderRadius?: number;
    borderWidth?: number;
    duration?: number;
    color?: TColorProp;
    className?: string;
    children: React.ReactNode;
}

/**
 * @name Shine Border
 * @description A dynamic shine border effect.
 * @param borderRadius The border radius of the shiny border. Default: 8
 * @param borderWidth The width of the border. Default: 1
 * @param duration The duration of the shine animation in seconds. Default: 14
 * @param color The color(s) of the shine. Default: "#000000"
 * @param className Additional classes for the container.
 * @param children The children of the component.
 */
export default function ShineBorder({
    borderRadius = 8,
    className,
    children,
}: ShineBorderProps) {
    return (
        <div
            style={
                {
                    "--border-radius": `${borderRadius}px`,
                } as React.CSSProperties
            }
            className={cn(
                "relative min-h-[60px] w-full rounded-[--border-radius] bg-white text-black dark:bg-black dark:text-white p-[1px]", // Added padding for border
                className,
            )}
        >
            <div
                className={cn(
                    "min-h-[60px] w-full p-0 rounded-[--border-radius] bg-background",
                    "before:absolute before:inset-0 before:aspect-video before:size-full before:rounded-[--border-radius] before:p-[1px] before:content-['']",
                    // Core shine effect
                    "before:bg-[length:300%_300%] before:bg-no-repeat",
                    "before:animate-shine before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.purple.500)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:will-change-[background-position]"
                )}
            >
                {children}
            </div>
        </div>
    );
}
