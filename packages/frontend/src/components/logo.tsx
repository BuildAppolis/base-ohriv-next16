import React, { SVGProps } from "react";
import Link from "next/link";

interface LogoProps {
	size?: "sm" | "md" | "lg";
	withText?: boolean;
	stacked?: boolean;
	className?: string;
	href?: string;
	noLink?: boolean;
}

// Size configuration
const SIZE_CONFIG = {
	sm: {
		icon: "w-6 h-6",
		text: "h-[17px]",  // ~4.25 (was h-4/16px)
		gap: "gap-2",
		fontSize: "text-sm"
	},
	md: {
		icon: "w-8 h-8",
		text: "h-[21px]",  // ~5.25 (was h-5/20px)
		gap: "gap-3",
		fontSize: "text-lg"
	},
	lg: {
		icon: "w-12 h-12",
		text: "h-[30px]",  // ~7.5 (was h-7/28px)
		gap: "gap-4",
		fontSize: "text-2xl"
	}
} as const;

const LogoIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 375 375"
		preserveAspectRatio="xMidYMid meet"
		className={className}
		{...props}
	>
		<defs>
			<clipPath id="logo-clip">
				<path d="M 1.53125 1.53125 L 373.53125 1.53125 L 373.53125 373.53125 L 1.53125 373.53125 Z M 1.53125 1.53125" clipRule="nonzero" />
			</clipPath>
		</defs>
		<g clipPath="url(#logo-clip)">
			<path
				fill="currentColor"
				d="M 187.519531 373.53125 C 84.738281 373.53125 1.460938 290.253906 1.460938 187.519531 C 1.460938 84.738281 84.738281 1.460938 187.519531 1.460938 C 290.253906 1.460938 373.53125 84.738281 373.53125 187.519531 C 373.53125 290.253906 290.253906 373.53125 187.519531 373.53125 Z M 187.519531 272.335938 C 234.371094 272.335938 272.335938 234.371094 272.335938 187.519531 C 272.335938 146.925781 243.851562 112.976562 205.734375 104.640625 C 189.65625 101.117188 191.886719 83.152344 201.714844 78.089844 C 211.691406 72.925781 218.488281 62.554688 218.488281 50.542969 C 218.488281 33.421875 204.644531 19.527344 187.519531 19.527344 C 170.398438 19.527344 156.503906 33.421875 156.503906 50.542969 C 156.503906 62.554688 163.300781 72.925781 173.277344 78.089844 C 183.105469 83.152344 185.335938 101.117188 169.257812 104.640625 C 131.191406 112.976562 102.65625 146.925781 102.65625 187.519531 C 102.65625 234.371094 140.621094 272.335938 187.519531 272.335938 Z M 187.519531 272.335938"
				fillOpacity="1"
				fillRule="evenodd"
			/>
		</g>
	</svg>
);

const LogoText = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 165 60"
		preserveAspectRatio="xMidYMid meet"
		className={className}
		{...props}
	>
		<defs>
			<clipPath id="text-clip-1">
				<path d="M 0 0 L 163.441406 0 L 163.441406 60 L 0 60 Z M 0 0" clipRule="nonzero" />
			</clipPath>
			<clipPath id="text-clip-2">
				<rect x="0" width="164" y="0" height="60" />
			</clipPath>
			<clipPath id="text-clip-3">
				<path d="M 114.058594 3.078125 L 125.039062 3.078125 L 125.039062 14.0625 L 114.058594 14.0625 Z M 114.058594 3.078125" clipRule="nonzero" />
			</clipPath>
			<clipPath id="text-clip-4">
				<path d="M 119.546875 3.078125 C 116.515625 3.078125 114.058594 5.539062 114.058594 8.570312 C 114.058594 11.601562 116.515625 14.0625 119.546875 14.0625 C 122.578125 14.0625 125.039062 11.601562 125.039062 8.570312 C 125.039062 5.539062 122.578125 3.078125 119.546875 3.078125 Z M 119.546875 3.078125" clipRule="nonzero" />
			</clipPath>
		</defs>
		<g clipPath="url(#text-clip-1)">
			<g clipPath="url(#text-clip-2)">
				<g fill="currentColor" fillOpacity="1">
					<g transform="translate(-0.000000000000027249, 54.491665)">
						<path d="M 43.484375 -22.6875 C 43.484375 -14.476562 41.910156 -8.546875 38.765625 -4.890625 C 35.628906 -1.242188 30.507812 0.578125 23.40625 0.578125 C 15.769531 0.578125 10.5 -1.113281 7.59375 -4.5 C 4.6875 -7.882812 3.234375 -13.945312 3.234375 -22.6875 C 3.234375 -30.84375 4.816406 -36.742188 7.984375 -40.390625 C 11.160156 -44.035156 16.300781 -45.859375 23.40625 -45.859375 C 31.03125 -45.859375 36.28125 -44.164062 39.15625 -40.78125 C 42.039062 -37.40625 43.484375 -31.375 43.484375 -22.6875 Z M 11.59375 -9.640625 C 12.5 -8.015625 13.835938 -6.863281 15.609375 -6.1875 C 17.390625 -5.519531 19.988281 -5.1875 23.40625 -5.1875 C 28.726562 -5.1875 32.375 -6.46875 34.34375 -9.03125 C 36.3125 -11.601562 37.296875 -16.15625 37.296875 -22.6875 C 37.296875 -25.945312 37.125 -28.617188 36.78125 -30.703125 C 36.445312 -32.796875 35.921875 -34.488281 35.203125 -35.78125 C 34.296875 -37.414062 32.960938 -38.578125 31.203125 -39.265625 C 29.453125 -39.960938 26.851562 -40.3125 23.40625 -40.3125 C 18.03125 -40.3125 14.359375 -39.015625 12.390625 -36.421875 C 10.421875 -33.835938 9.4375 -29.257812 9.4375 -22.6875 C 9.4375 -19.414062 9.601562 -16.734375 9.9375 -14.640625 C 10.269531 -12.554688 10.820312 -10.890625 11.59375 -9.640625 Z M 11.59375 -9.640625" />
					</g>
				</g>
				<g fill="currentColor" fillOpacity="1">
					<g transform="translate(46.728851, 54.491665)">
						<path d="M 10.65625 0 L 4.75 0 L 4.75 -47.875 L 10.65625 -47.875 L 10.65625 -32.6875 C 12.8125 -33.882812 14.957031 -34.78125 17.09375 -35.375 C 19.226562 -35.976562 21.351562 -36.28125 23.46875 -36.28125 C 27.40625 -36.28125 30.367188 -35.296875 32.359375 -33.328125 C 34.359375 -31.367188 35.359375 -28.46875 35.359375 -24.625 L 35.359375 0 L 29.453125 0 L 29.453125 -23.90625 C 29.453125 -26.351562 28.8125 -28.140625 27.53125 -29.265625 C 26.257812 -30.390625 24.28125 -30.953125 21.59375 -30.953125 C 19.820312 -30.953125 17.988281 -30.710938 16.09375 -30.234375 C 14.195312 -29.753906 12.382812 -29.082031 10.65625 -28.21875 Z M 10.65625 0" />
					</g>
				</g>
				<g fill="currentColor" fillOpacity="1">
					<g transform="translate(86.545577, 54.491665)">
						<path d="M 10.65625 0 L 4.75 0 L 4.75 -35.5625 L 10.15625 -35.5625 L 10.4375 -32.546875 L 10.734375 -32.546875 C 12.597656 -33.648438 14.46875 -34.476562 16.34375 -35.03125 C 18.21875 -35.582031 20.066406 -35.859375 21.890625 -35.859375 C 22.660156 -35.859375 23.175781 -35.859375 23.4375 -35.859375 C 23.695312 -35.859375 23.898438 -35.832031 24.046875 -35.78125 L 24.046875 -30.09375 C 23.710938 -30.1875 23.289062 -30.242188 22.78125 -30.265625 C 22.28125 -30.296875 21.503906 -30.3125 20.453125 -30.3125 C 18.722656 -30.3125 17.03125 -30.109375 15.375 -29.703125 C 13.71875 -29.296875 12.144531 -28.679688 10.65625 -27.859375 Z M 10.65625 0" />
					</g>
				</g>
				<g fill="currentColor" fillOpacity="1">
					<g transform="translate(111.962037, 54.491665)">
						<path d="M 10.875 -41.765625 L 4.53125 -41.765625 L 4.53125 -47.875 L 10.875 -47.875 Z M 10.65625 0 L 4.75 0 L 4.75 -35.5625 L 10.65625 -35.5625 Z M 10.65625 0" />
					</g>
				</g>
				<g fill="currentColor" fillOpacity="1">
					<g transform="translate(127.370317, 54.491665)">
						<path d="M 28.375 -35.5625 L 34.84375 -35.5625 L 21.171875 0 L 14.40625 0 L 0.71875 -35.5625 L 7.265625 -35.5625 L 17.859375 -5.40625 Z M 28.375 -35.5625" />
					</g>
				</g>
			</g>
		</g>
		<g clipPath="url(#text-clip-3)">
			<g clipPath="url(#text-clip-4)">
				<g transform="matrix(1, 0, 0, 1, 114, 3)">
					<path
						fill="hsl(var(--primary))"
						d="M 0.0585938 0.078125 L 11.039062 0.078125 L 11.039062 11.0625 L 0.0585938 11.0625 Z M 0.0585938 0.078125"
						fillOpacity="1"
						fillRule="nonzero"
						className="fill-primary"
					/>
				</g>
			</g>
		</g>
	</svg>
);

export const Logo = ({
	size = "md",
	withText = false,
	stacked = false,
	className = "",
	href = undefined,
}: LogoProps) => {
	const sizes = SIZE_CONFIG[size];
	const layoutClass = stacked ? "flex-col items-center" : "items-center";

	// Use Tailwind classes for the main colors
	const logoColorClass = "text-[#002a62] dark:text-[#a4deff]";
	const textColorClasses = "text-foreground";

	// Build transition classes from config
	const transitionClass = "transition-all duration-300 ease-in-out";
	const hoverClass = "hover:opacity-90";

	const content = (
		<div className={`flex ${layoutClass} ${sizes.gap} ${className}`}>
			<LogoIcon
				className={`${sizes.icon} ${logoColorClass} flex-shrink-0 ${transitionClass}`}
			/>
			{withText && (
				<LogoText
					className={`${sizes.text} ${textColorClasses} flex-shrink-0 ${transitionClass}`}
				/>
			)}
		</div>
	);

	if (href) {
		return (
			<Link
				href={href}
				className={`inline-flex ${hoverClass} ${transitionClass}`}
			>
				{content}
			</Link>
		);
	}

	return content;
};