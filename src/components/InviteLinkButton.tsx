'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Check, Link2, Share2 } from "lucide-react"

// Utility hook for media query
function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}

function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)")
}

// Drawer Components
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[20px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

// Main Invite Link Component
interface InviteLinkComponentProps {
  inviteLink?: string
  title?: string
  description?: string
}

const InviteLinkContent = ({ 
  inviteLink = "https://yourapp.com/invite/abc123",
  title = "Invite Friends",
  description = "Share this link with your friends to invite them"
}: InviteLinkComponentProps) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4 bg-black text-white p-6 rounded-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={inviteLink}
              readOnly
              className="pr-10 bg-gray-800 text-white border-gray-600"
            />
            <Link2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button 
          onClick={handleCopy} 
          className="w-full py-5 bg-[rgb(0,107,179)] border-[3px] border-[#ffffff4d] rounded-b-[20px] text-white text-base font-bold cursor-pointer transition-all duration-300 ease-in-out mt-0 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] relative overflow-hidden flex items-center justify-center gap-2 hover:scale-[1.05] hover:border-[#fff9] hover:before:animate-[shine_1.5s_ease-out_infinite] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 text-white"
              >
                <Check className="h-4 w-4" /> Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 text-white"
              >
                <Copy className="h-4 w-4" /> Copy Link
              </motion.span>
            )}
          </AnimatePresence>
          
          {!copied && (
            <svg className="w-6 h-6 transition-all duration-300 ease-in-out group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

            <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
              <h4 className="mb-2 text-sm font-medium text-white">How it works:</h4>
              <div className="text-sm text-gray-300">
                <p>Send your invitation link, friends join the node through your link, and you will get generous token rewards.</p>
              </div>
            </div>
    </div>
  )
}

const ResponsiveInviteLink = ({
  inviteLink = "https://yourapp.com/invite/abc123",
  title = "Invite Friends",
  description = "Share this link with your friends to invite them"
}: InviteLinkComponentProps) => {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 invite-link-trigger"
            style={{ 
              backgroundColor: 'white', 
              color: 'black', 
              borderColor: '#d1d5db'
            }}
          >
            <Share2 className="h-4 w-4" />
            Share Invite
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-black border-gray-700 rounded-t-[20px]">
          <DrawerHeader className="bg-black rounded-t-[20px]">
            <DrawerTitle className="text-white">{title}</DrawerTitle>
            <DrawerDescription className="text-gray-300">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 bg-black">
            <InviteLinkContent 
              inviteLink={inviteLink}
              title=""
              description=""
            />
          </div>
          <DrawerFooter className="bg-black">
            <DrawerClose asChild>
              <Button variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 invite-link-trigger"
          style={{ 
            backgroundColor: 'white', 
            color: 'black', 
            borderColor: '#d1d5db'
          }}
        >
          <Share2 className="h-4 w-4" />
          Share Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black border-gray-700">
        <DialogHeader className="bg-black">
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-300">{description}</DialogDescription>
        </DialogHeader>
        <InviteLinkContent 
          inviteLink={inviteLink}
          title=""
          description=""
        />
      </DialogContent>
    </Dialog>
  )
}

export default ResponsiveInviteLink
