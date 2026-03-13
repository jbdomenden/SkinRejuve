export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'text-center' : 'text-center'}>
      <h1 className='font-serif text-5xl tracking-wide text-ivory'>SKIN REJUVE</h1>
      <div className='mt-1 border-t border-gold/50 pt-2 text-xl tracking-[0.5em] text-ivory/90'>SINCE 2011</div>
    </div>
  )
}
