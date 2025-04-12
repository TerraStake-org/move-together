import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RewardBreakdown {
  baseReward: number;
  timeBonus: number;
  streakBonus: number;
  finalReward: number;
  userStreak: number;
  isTimeBonusActive: boolean;
}

interface RewardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardBreakdown: RewardBreakdown;
}

export default function RewardDetailsModal({ 
  isOpen, 
  onClose,
  rewardBreakdown
}: RewardDetailsModalProps) {
  const { 
    baseReward, 
    timeBonus, 
    streakBonus, 
    finalReward, 
    userStreak,
    isTimeBonusActive
  } = rewardBreakdown;

  const timeBonusAmount = timeBonus - baseReward;
  const streakBonusAmount = streakBonus - timeBonus;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-gray border-gray-700 text-light-gray sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <span className="material-icons text-primary mr-2">emoji_events</span>
            Reward Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-center text-primary mb-2">Movement Rewards</h3>
            <p className="text-sm text-gray-400 text-center mb-4">
              Here's how your MOVE tokens were calculated
            </p>
            
            <div className="space-y-3">
              {/* Base Reward */}
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <p className="font-medium">Base Distance Reward</p>
                  <p className="text-xs text-gray-400">1 MOVE per km with bonus for distances &gt;5km</p>
                </div>
                <p className="font-bold text-primary">{baseReward.toFixed(2)} MOVE</p>
              </div>
              
              {/* Time Bonus */}
              <div className={cn(
                "flex justify-between items-center py-2 border-b border-gray-700",
                !isTimeBonusActive && "opacity-50"
              )}>
                <div>
                  <p className="font-medium flex items-center">
                    Time Bonus
                    {isTimeBonusActive && <span className="material-icons text-secondary text-sm ml-1">schedule</span>}
                  </p>
                  <p className="text-xs text-gray-400">+15% during peak activity hours</p>
                </div>
                <p className={cn(
                  "font-bold",
                  isTimeBonusActive ? "text-secondary" : "text-gray-500"
                )}>
                  {isTimeBonusActive ? `+${timeBonusAmount.toFixed(2)}` : '0.00'} MOVE
                </p>
              </div>
              
              {/* Streak Bonus */}
              <div className={cn(
                "flex justify-between items-center py-2 border-b border-gray-700",
                userStreak < 2 && "opacity-50"
              )}>
                <div>
                  <p className="font-medium flex items-center">
                    Streak Bonus
                    {userStreak > 1 && <span className="material-icons text-amber-500 text-sm ml-1">local_fire_department</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userStreak > 1 
                      ? `+${(userStreak - 1) * 10}% for ${userStreak} day streak` 
                      : "Activate by moving 2+ days in a row"}
                  </p>
                </div>
                <p className={cn(
                  "font-bold",
                  userStreak > 1 ? "text-amber-500" : "text-gray-500"
                )}>
                  {userStreak > 1 ? `+${streakBonusAmount.toFixed(2)}` : '0.00'} MOVE
                </p>
              </div>
              
              {/* Total Reward */}
              <div className="flex justify-between items-center py-3 mt-2 border-t border-primary/30 bg-primary/10 px-3 rounded">
                <p className="font-bold">Total Reward</p>
                <p className="font-bold text-xl text-white">{finalReward.toFixed(2)} MOVE</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-2">Reward Maximization Tips:</h4>
            <ul className="text-sm space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                <span>Move consistently to build your streak bonus (up to +50%)</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                <span>Activity during peak hours (5-7AM, 6-8PM) earns +15%</span>
              </li>
              <li className="flex items-start">
                <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                <span>Longer distances (over 5km) earn additional bonuses</span>
              </li>
            </ul>
          </div>
          
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={onClose}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}