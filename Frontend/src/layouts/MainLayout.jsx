import Header from '@/components/partials/header'
import PageRouter from './PageRouter'

function MainLayout() {
  return (
	<section className='min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]'>
		
        <Header />
		<PageRouter/>
	</section>
  )
}

export default MainLayout
