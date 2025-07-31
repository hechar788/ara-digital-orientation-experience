import { DesktopNavigation, MobileNavigation } from '@/components/Navigation'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <DesktopNavigation />
        <MobileNavigation />
      </div>
    </header>
  )
}
