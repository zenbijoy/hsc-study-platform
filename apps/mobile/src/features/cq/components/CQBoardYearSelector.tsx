import React from 'react';
import { ScrollView } from 'react-native';
import { Chip } from '@/src/components/ui/Chip';

const BOARDS = [
  { id: 'all', label: 'All Boards' },
  { id: 'ঢাকা বোর্ড', label: 'Dhaka' },
  { id: 'রাজশাহী বোর্ড', label: 'Rajshahi' },
  { id: 'চট্টগ্রাম বোর্ড', label: 'Chattogram' },
  { id: 'কুমিল্লা বোর্ড', label: 'Comilla' },
  { id: 'সিলেট বোর্ড', label: 'Sylhet' },
  { id: 'যশোর বোর্ড', label: 'Jashore' },
  { id: 'বরিশাল বোর্ড', label: 'Barishal' },
  { id: 'দিনাজপুর বোর্ড', label: 'Dinajpur' },
];

export function CQBoardYearSelector({
  selectedBoard,
  onSelectBoard,
}: {
  selectedBoard: string;
  onSelectBoard: (board: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3 -mx-4 px-4"
      contentContainerStyle={{ gap: 6 }}
    >
      {BOARDS.map((b) => (
        <Chip
          key={b.id}
          label={b.label}
          selected={selectedBoard === b.id}
          onPress={() => onSelectBoard(b.id)}
        />
      ))}
    </ScrollView>
  );
}
