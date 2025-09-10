import type { MDXComponents } from "mdx/types"

import { Pre, RawCode, highlight } from "codehike/code"

import { DEFAULT_CODE_THEME } from "@/app/const"

export function Code({ codeblock }: { codeblock: RawCode }) {
  // For now, return a simple pre element until we can properly handle async highlighting
  return (
    <pre>
      <code>{codeblock.value}</code>
    </pre>
  )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Code,
  }
}