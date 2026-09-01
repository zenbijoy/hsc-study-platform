import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { FormulaVariable } from '../types/formula.types';

export function FormulaVariablesTable({
  variables,
}: {
  variables: FormulaVariable[];
}) {
  const theme = useTheme();

  if (!variables || variables.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Variables Breakdown"
        subtitle="Symbols, Bengali meanings, and standard SI units"
      />

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          }}
          className="flex-row items-center px-4 py-2.5"
        >
          <AppText variant="caption" color="muted" style={{ width: 50, fontWeight: '700' }}>
            SYMBOL
          </AppText>
          <AppText variant="caption" color="muted" className="flex-1 font-bold">
            MEANING (বিবরণ)
          </AppText>
          <AppText variant="caption" color="muted" style={{ width: 60, textAlign: 'right', fontWeight: '700' }}>
            SI UNIT
          </AppText>
        </View>

        {/* Table Rows */}
        {variables.map((v, idx) => (
          <View
            key={`${v.symbol}-${idx}`}
            style={{
              borderBottomColor: idx < variables.length - 1 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderBottomWidth: idx < variables.length - 1 ? 1 : 0,
            }}
            className="flex-row items-center px-4 py-3"
          >
            <View style={{ width: 50 }}>
              <AppText variant="labelMedium" color="mint" style={{ fontFamily: 'monospace', fontWeight: '800' }}>
                {v.symbol}
              </AppText>
            </View>

            <View className="flex-1 pr-2">
              <AppText variant="bodyMedium" color="primary">
                {v.meaningBn}
              </AppText>
              {v.meaningEn ? (
                <AppText variant="caption" color="muted">
                  {v.meaningEn}
                </AppText>
              ) : null}
            </View>

            <View style={{ width: 60, alignItems: 'flex-end' }}>
              <AppText variant="caption" color="sky" style={{ fontWeight: '700' }}>
                {v.unit || '—'}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}
