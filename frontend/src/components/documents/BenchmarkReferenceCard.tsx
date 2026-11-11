import React from 'react';
import { BenchmarkBanner, BenchmarkBannerProps } from '../common/BenchmarkBanner';

export interface BenchmarkReferenceCardProps extends Omit<BenchmarkBannerProps, 'variant'> {
  variant?: 'document';
}

export const BenchmarkReferenceCard: React.FC<BenchmarkReferenceCardProps> = (props) => {
  return <BenchmarkBanner {...props} variant="document" />;
};
