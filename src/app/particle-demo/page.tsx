import { MiningParticleText } from "@/components/ui/mining-particle-text";

export default function ParticleDemo() {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/login/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <MiningParticleText showInstructions={true} />
    </div>
  );
}
