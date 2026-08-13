import PopularBus from "../components/PopularBus"
import SearchItem from "../components/SearchItem"
import WhyVinBus from "../components/WhyVinBus"


const Home = () => {
  return (
   <>
      <section
        className='bg-cover bg-no-repeat mt-16'
        style={{
          backgroundImage: "url('/VB-bg.png')",
        }}
      >
        <div className="container mx-auto min-h-screen">
          <SearchItem />
          <a href="/buses" className="text-center font-bold text-2xl mt-20 flex justify-center items-center cursor-pointer active:scale-95 underline
          bg-gradient-to-r from-yellow-500 via-pink-300 to-green-700 bg-clip-text text-transparent">Khám phá các tuyến VinBus</a>
        </div>
      </section>

      <PopularBus />

      <WhyVinBus />

   </>


  )
}

export default Home