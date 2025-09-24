
"use client";

import { useEffect, useState } from "react";
import { Droppable, DroppableProps } from "react-beautiful-dnd";

export const DroppableWrapper = ({ children, ...props }: DroppableProps) => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? <Droppable {...props}>{children}</Droppable> : null;
};
