"use client";

import { useState, useContext } from "react";
import { Exam } from "@/lib/types";
import { AppDataContext } from "@/context/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ExamDialog } from "./ExamDialog";
import { Pen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamItemProps {
  exam: Exam;
}

export function ExamItem({ exam }: ExamItemProps) {
  const { dispatch } = useContext(AppDataContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleStatusChange = (isCompleted: boolean) => {
    dispatch({
      type: "UPDATE_EXAM",
      payload: { ...exam, isCompleted },
    });
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this exam?")) {
      dispatch({
        type: "DELETE_EXAM",
        payload: exam.id,
      });
    }
  }

  const isPast = new Date(exam.date) < new Date();

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <span>{exam.name}</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
                    <Pen className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {format(new Date(exam.date), "PPP")}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => handleStatusChange(false)}
            variant={!exam.isCompleted ? "destructive" : "outline"}
            size="sm"
            className={cn("w-1/2 mr-1", !exam.isCompleted ? "bg-red-500 text-white" : "")}
          >
            Not Completed
          </Button>
          <Button
            onClick={() => handleStatusChange(true)}
            variant={exam.isCompleted ? "default" : "outline"}
            size="sm"
            className={cn("w-1/2 ml-1", exam.isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : "")}
          >
            Completed
          </Button>
        </CardFooter>
      </Card>
      <ExamDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} exam={exam} />
    </>
  );
}
