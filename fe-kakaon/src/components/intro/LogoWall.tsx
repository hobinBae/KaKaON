import Section from './Section';

const logos = [
  // TODO: 실제 로고 이미지 경로로 교체
  { name: 'Client Logo 1', src: '/path/to/logo1.svg' },
  { name: 'Client Logo 2', src: '/path/to/logo2.svg' },
  { name: 'Client Logo 3', src: '/path/to/logo3.svg' },
  { name: 'Client Logo 4', src: '/path/to/logo4.svg' },
  { name: 'Client Logo 5', src: '/path/to/logo5.svg' },
];

export default function LogoWall() {
  return (
    <Section id="logo-wall" className="py-8 md:py-12">
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos.map((logo) => (
          <img
            key={logo.name}
            src={logo.src}
            alt={logo.name}
            className="h-8 md:h-10 object-contain"
            loading="lazy"
          />
        ))}
      </div>
    </Section>
  );
}
