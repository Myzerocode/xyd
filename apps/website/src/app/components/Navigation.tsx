"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, BookIcon, CodeIcon, BeakerIcon, GearIcon } from "@primer/octicons-react"
import { IconLiveSession } from "@/app/components/index"

interface NavigationProps {
  className?: string
}

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(href)
  }

  const isSectionActive = (section: string) => {
    return pathname?.startsWith(`/${section}`)
  }

  const navigationSections = {
    guides: [
      { href: "/docs/guides/introduction", label: "Introduction" },
      { href: "/docs/guides/quickstart", label: "Quick Start" },
      { href: "/docs/guides/customization-quickstart", label: "Customization" },
      { href: "/docs/guides/components", label: "Components" },
      { href: "/docs/guides/themes", label: "Themes" },
      { href: "/docs/guides/deploy", label: "Deploy" },
    ],
    reference: [
      { href: "/docs/reference/cli/overview", label: "CLI Reference" },
      { href: "/docs/reference/core/overview", label: "Core API" },
      { href: "/docs/reference/composer/overview", label: "Composer" },
      { href: "/docs/reference/functions/overview", label: "Functions" },
    ],
    samples: [
      { href: "/docs/samples", label: "Sample Docs" },
      { href: "/docs/samples/approved-1", label: "Approved Examples" },
    ]
  }

  return (
    <nav className={`navigation ${className}`} style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo and Brand */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <IconLiveSession fill="#fff" />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            Sophosic
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Link
            href="/"
            style={{
              color: isActive("/") ? "#0070f3" : "#fff",
              textDecoration: "none",
              fontWeight: isActive("/") ? "600" : "400",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              backgroundColor: isActive("/") ? "rgba(0, 112, 243, 0.1)" : "transparent"
            }}
          >
            Home
          </Link>

          {/* Create Button */}
          <Link
            href="/docs"
            style={{
              color: isActive("/docs") ? "#0070f3" : "#fff",
              textDecoration: "none",
              fontWeight: isActive("/docs") ? "600" : "400",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              backgroundColor: isActive("/docs") ? "rgba(0, 112, 243, 0.1)" : "transparent"
            }}
          >
            Create
          </Link>

          {/* Guides Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setDropdownOpen('guides')}
            onMouseLeave={() => !isMobile && setDropdownOpen(null)}
          >
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'guides' ? null : 'guides')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isSectionActive('docs/guides') ? "#0070f3" : "#fff",
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isSectionActive('docs/guides') ? "600" : "400",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            >
              <BookIcon size={14} />
              Guides
              <ChevronDownIcon size={12} />
            </button>
            {dropdownOpen === 'guides' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 0',
                minWidth: '200px',
                zIndex: 1000
              }}>
                {navigationSections.guides.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'block',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reference Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setDropdownOpen('reference')}
            onMouseLeave={() => !isMobile && setDropdownOpen(null)}
          >
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'reference' ? null : 'reference')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isSectionActive('docs/reference') ? "#0070f3" : "#fff",
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isSectionActive('docs/reference') ? "600" : "400",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            >
              <CodeIcon size={14} />
              Reference
              <ChevronDownIcon size={12} />
            </button>
            {dropdownOpen === 'reference' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 0',
                minWidth: '200px',
                zIndex: 1000
              }}>
                {navigationSections.reference.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'block',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Samples Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => !isMobile && setDropdownOpen('samples')}
            onMouseLeave={() => !isMobile && setDropdownOpen(null)}
          >
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'samples' ? null : 'samples')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isSectionActive('docs/samples') ? "#0070f3" : "#fff",
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isSectionActive('docs/samples') ? "600" : "400",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            >
              <BeakerIcon size={14} />
              Samples
              <ChevronDownIcon size={12} />
            </button>
            {dropdownOpen === 'samples' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem 0',
                minWidth: '200px',
                zIndex: 1000
              }}>
                {navigationSections.samples.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'block',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin"
            style={{
              color: isActive("/admin") ? "#0070f3" : "#fff",
              textDecoration: "none",
              fontWeight: isActive("/admin") ? "600" : "400",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              backgroundColor: isActive("/admin") ? "rgba(0, 112, 243, 0.1)" : "transparent"
            }}
          >
            <GearIcon size={14} />
            Admin
          </Link>
        </div>
      </div>

      <style jsx>{`
        .navigation:hover a:not(:hover) {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .navigation div > div {
            flex-direction: column;
            gap: 1rem;
            height: auto;
            padding: 1rem 0;
          }

          .navigation div > div > div:last-child {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </nav>
  )
}
