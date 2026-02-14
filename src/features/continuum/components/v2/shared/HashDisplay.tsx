import { memo, useCallback, useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui'

interface HashDisplayProps {
  hash: string
  prefixLength?: number
  suffixLength?: number
  className?: string
  link?: string
}

export const HashDisplay = memo(function HashDisplay({
  hash,
  prefixLength = 6,
  suffixLength = 4,
  className,
  link,
}: HashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const truncated = hash.length > prefixLength + suffixLength + 3
    ? `${hash.slice(0, prefixLength)}...${hash.slice(-suffixLength)}`
    : hash

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [hash])

  const content = (
    <span className={cn('inline-flex items-center gap-2 group', className)}>
      <Tooltip>
        <TooltipTrigger>
          <code className="font-mono text-xs tabular-nums">{truncated}</code>
        </TooltipTrigger>
        <TooltipContent>
          <code className="text-[10px]">{hash}</code>
        </TooltipContent>
      </Tooltip>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Copy hash"
      >
        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      </button>
    </span>
  )

  if (link) {
    return <a href={link} className="hover:underline">{content}</a>
  }

  return content
})
