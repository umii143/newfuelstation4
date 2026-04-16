import { ShiftClosingWizardState } from './index';

export interface StepProps {
    mode: 'FUEL' | 'CNG';
    onUpdate: (updates: Partial<ShiftClosingWizardState>) => void;
    data: ShiftClosingWizardState;
}

export interface TransitionItem {
    id: string;
    type: string;
    amount: number;
    timestamp: string;
    description?: string;
    [key: string]: any;
}
