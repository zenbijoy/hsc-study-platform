"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { RightsStatus } from '@/lib/api';

export function RightsEditor({
  initialStatus = 'UNVERIFIED',
  initialDistributionAllowed = false,
  onChange,
}: {
  initialStatus?: RightsStatus;
  initialDistributionAllowed?: boolean;
  onChange: (rights: {
    status: RightsStatus;
    distributionAllowed: boolean;
  }) => void;
}) {
  const [status, setStatus] = useState<RightsStatus>(initialStatus);
  const [distributionAllowed, setDistributionAllowed] = useState(
    initialDistributionAllowed
  );

  useEffect(() => {
    onChange({ status, distributionAllowed });
  }, [status, distributionAllowed, onChange]);

  const isUnverified = status === 'UNVERIFIED';

  return (
    <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-mint" />
          <h4 className="text-base font-bold text-white">
            Content Rights & Licensing
          </h4>
        </div>

        {isUnverified && (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Unverified Rights
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1.5">
            Rights Classification Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              const val = e.target.value as RightsStatus;
              setStatus(val);
              if (val === 'UNVERIFIED') setDistributionAllowed(false);
              else if (val === 'LICENSED' || val === 'OPEN_LICENSE' || val === 'PUBLIC_DOMAIN' || val === 'PUBLISHER_AUTHORIZED') {
                setDistributionAllowed(true);
              }
            }}
            className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mint"
          >
            <option value="UNVERIFIED">UNVERIFIED (Blocks student access)</option>
            <option value="LICENSED">LICENSED (Verified permission)</option>
            <option value="OPEN_LICENSE">OPEN_LICENSE (CC / Open educational)</option>
            <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN (NCTB Open)</option>
            <option value="PUBLISHER_AUTHORIZED">PUBLISHER_AUTHORIZED (Official)</option>
            <option value="OWNED">OWNED (Proprietary platform content)</option>
            <option value="INTERNAL_ONLY">INTERNAL_ONLY (Admin test)</option>
          </select>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={distributionAllowed}
              disabled={isUnverified}
              onChange={(e) => setDistributionAllowed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-[#121824] text-mint focus:ring-mint accent-[#57E0B7]"
            />
            <div>
              <span className="text-sm font-semibold text-white">
                Allow student distribution & offline downloads
              </span>
              <p className="text-xs text-white/50 mt-0.5">
                When enabled, authenticated students can stream and store encrypted HSCP packages.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
