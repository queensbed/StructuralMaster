import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoadingModal({ isOpen, onClose }: LoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [stepText, setStepText] = useState("Initializing analysis...");

  const steps = [
    "Initializing analysis...",
    "Computing stiffness matrix...",
    "Solving system equations...",
    "Calculating results..."
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStep(1);
      setStepText(steps[0]);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 25;
        if (newProgress >= 100) {
          setTimeout(() => {
            onClose();
            setProgress(0);
            setStep(1);
            setStepText(steps[0]);
          }, 500);
          return 100;
        }
        
        const currentStep = Math.floor(newProgress / 25);
        setStep(currentStep + 1);
        setStepText(steps[currentStep] || steps[steps.length - 1]);
        
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4">
        <div className="text-center p-6">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Running Analysis</h3>
          <p className="text-sm text-neutral-600 mb-4">Processing structural calculations...</p>
          
          <Progress value={progress} className="mb-2" />
          
          <p className="text-xs text-neutral-500">
            Step {step} of {steps.length}: {stepText}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
