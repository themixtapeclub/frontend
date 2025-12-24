const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-black">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-4">
        <h1 className="text-3xl leading-10 text-white bold uppercase tracking-wide">
          The Mixtape Club
        </h1>
        <h2 className="text-xl leading-10 text-white font-normal mt-2">
          Vinyl • Mixtapes • Culture
        </h2>
      </div>
    </div>
  )
}

export default Hero
