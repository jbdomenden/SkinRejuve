import { PropsWithChildren, ReactNode } from 'react'

type AdminModalProps = PropsWithChildren<{
  title: string
  onClose: () => void
  actions?: ReactNode
}>

export function AdminModal({ title, onClose, actions, children }: AdminModalProps) {
  return (
    <div className='fixed inset-0 z-40 grid place-items-center bg-[#2a1406]/65 p-6'>
      <div className='w-full max-w-2xl rounded-md border border-[#8a5a2f]/50 bg-[#f5eee4] p-6 text-[#4a2a00] shadow-2xl'>
        <div className='mb-4 flex items-center justify-between border-b border-[#8a5a2f]/25 pb-3'>
          <h3 className='font-serif text-4xl'>{title}</h3>
          <button className='text-sm tracking-[0.2em]' onClick={onClose}>CLOSE</button>
        </div>
        <div>{children}</div>
        {actions ? <div className='mt-6 flex justify-end gap-3'>{actions}</div> : null}
      </div>
    </div>
  )
}
