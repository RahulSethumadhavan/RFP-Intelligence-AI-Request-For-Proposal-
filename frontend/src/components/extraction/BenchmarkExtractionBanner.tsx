import React from 'react';
import { BenchmarkBanner, BenchmarkBannerProps } from '../common/BenchmarkBanner';

export interface BenchmarkExtractionBannerProps extends Omit<BenchmarkBannerProps, 'variant'> {
  variant?: 'extraction';
}

export const BenchmarkExtractionBanner: React.FC<BenchmarkExtractionBannerProps> = (props) => {
  return <BenchmarkBanner {...props} variant="extraction" />;
};
