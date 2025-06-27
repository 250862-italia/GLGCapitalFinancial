import PackageProviderWrapper from '../package-provider';

export default function ReservedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PackageProviderWrapper>
      {children}
    </PackageProviderWrapper>
  );
} 