import { memo, useCallback, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui'

interface AddressDisplayProps {
  address: string
  prefixLength?: number
  suffixLength?: number
  className?: string
  href?: string
}

export const AddressDisplay = memo(function AddressDisplay({
  address,
  prefixLength = 6,
  suffixLength = 4,
  className,
  href,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const truncated = address.length > prefixLength + suffixLength + 3
    ? `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
    : address

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [address])

  const content = (
    <span className={cn('inline-flex items-center gap-1.5 group', className)}>
      <Tooltip>
        <TooltipTrigger>
          <code className="font-mono text-xs tabular-nums">{truncated}</code>
        </TooltipTrigger>
        <TooltipContent>
          <code className="text-[10px]">{address}</code>
        </TooltipContent>
      </Tooltip>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Copy address"
      >
        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      </button>
    </span>
  )

  if (href) {
    return <Link to={href} className="hover:underline">{content}</Link>
  }

  return content
})
