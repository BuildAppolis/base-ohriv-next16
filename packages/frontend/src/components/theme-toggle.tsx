"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="relative overflow-hidden"
		>
			<Sun className="theme-toggle-icon h-6 w-6 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
			<Moon className="theme-toggle-icon absolute h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
