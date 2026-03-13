import { PortalShell } from '@/components/layout'

const services = [
  ['DOCTORS PROCEDURES', '999PHP'],
  ['EMBRACE MORPHEUS', '2,000PHP'],
  ['FACE AND BODY CONTOURING', '3,000PHP'],
  ['FACIAL SERVICES', '2,500PHP'],
  ['GLUTA DRIP', '3,000PHP'],
  ['HARMONY XL PRO', '3,000PHP'],
  ['PICOLUXE 785', '2,000PHP'],
] as const

export function ServicesPage() {
  return (
    <PortalShell>
      <h1 className='max-w-4xl font-serif text-8xl leading-tight text-ivory'>Explore our exceptional range of top-notch services.</h1>
      <div className='mt-8 grid grid-cols-4 gap-5'>
        {services.map(([name, price], i) => (
          <div key={name} className={`min-h-[230px] border border-brand/20 p-6 text-center ${i === 6 ? 'bg-brand text-ivory' : 'bg-paper text-brand'}`}>
            <div className='mt-10 text-4xl font-semibold tracking-[0.15em]'>{name}</div>
            <div className='mt-16 text-3xl underline'>Learn More</div>
            <div className='mt-8 text-3xl'>{price}</div>
          </div>
        ))}
      </div>
      <p className='mt-8 text-center font-serif text-6xl text-ivory'>CLICK AND CHOOSE TREATMENT TO PROCEED.</p>
    </PortalShell>
  )
}
