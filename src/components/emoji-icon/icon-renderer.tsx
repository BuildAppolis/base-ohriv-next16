import * as HeroIcons from "@heroicons/react/20/solid";

export const IconRenderer = ({
    icon,
    ...rest
}: {
    icon: string;
} & React.ComponentPropsWithoutRef<"svg">) => {
    const IconComponent = HeroIcons[icon as keyof typeof HeroIcons];

    if (!IconComponent) {
        return null;
    }

    return <IconComponent data-slot="icon" {...rest} />;
};